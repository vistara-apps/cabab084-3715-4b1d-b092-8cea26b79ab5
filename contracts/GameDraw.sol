// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GameDraw is VRFConsumerBaseV2, Ownable, ReentrancyGuard {
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    struct Game {
        uint256 gameId;
        address creator;
        string gameType; // "lottery", "raffle", "tournament"
        uint256 entryFee;
        uint256 startTime;
        uint256 endTime;
        string winningConditions;
        uint256 totalPrize;
        uint256 participantCount;
        bool isActive;
        bool isCompleted;
        address winner;
        uint256 drawTxHash;
    }

    struct Participant {
        address user;
        uint256 entryTime;
        uint256 ticketId;
    }

    mapping(uint256 => Game) public games;
    mapping(uint256 => Participant[]) public gameParticipants;
    mapping(uint256 => uint256) public requestIdToGameId;
    mapping(address => uint256[]) public userGames;

    uint256 public gameCounter;
    uint256 public platformFee = 50; // 5% in basis points

    event GameCreated(uint256 indexed gameId, address indexed creator, string gameType);
    event GameEntered(uint256 indexed gameId, address indexed participant, uint256 ticketId);
    event GameDrawn(uint256 indexed gameId, address indexed winner, uint256 prize);
    event RandomnessRequested(uint256 indexed requestId, uint256 indexed gameId);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
    }

    function createGame(
        string memory _gameType,
        uint256 _entryFee,
        uint256 _duration,
        string memory _winningConditions
    ) external payable nonReentrant {
        require(_entryFee > 0, "Entry fee must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(bytes(_gameType).length > 0, "Game type cannot be empty");

        gameCounter++;
        uint256 gameId = gameCounter;

        games[gameId] = Game({
            gameId: gameId,
            creator: msg.sender,
            gameType: _gameType,
            entryFee: _entryFee,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            winningConditions: _winningConditions,
            totalPrize: 0,
            participantCount: 0,
            isActive: true,
            isCompleted: false,
            winner: address(0),
            drawTxHash: 0
        });

        userGames[msg.sender].push(gameId);

        emit GameCreated(gameId, msg.sender, _gameType);
    }

    function enterGame(uint256 _gameId) external payable nonReentrant {
        Game storage game = games[_gameId];
        require(game.isActive, "Game is not active");
        require(!game.isCompleted, "Game is already completed");
        require(block.timestamp < game.endTime, "Game entry period has ended");
        require(msg.value == game.entryFee, "Incorrect entry fee");

        // Check if user already entered
        for (uint256 i = 0; i < gameParticipants[_gameId].length; i++) {
            require(gameParticipants[_gameId][i].user != msg.sender, "User already entered this game");
        }

        uint256 ticketId = gameParticipants[_gameId].length + 1;

        gameParticipants[_gameId].push(Participant({
            user: msg.sender,
            entryTime: block.timestamp,
            ticketId: ticketId
        }));

        game.participantCount++;
        game.totalPrize += msg.value;

        userGames[msg.sender].push(_gameId);

        emit GameEntered(_gameId, msg.sender, ticketId);
    }

    function drawWinner(uint256 _gameId) external nonReentrant {
        Game storage game = games[_gameId];
        require(game.creator == msg.sender || msg.sender == owner(), "Only game creator or owner can draw winner");
        require(game.isActive, "Game is not active");
        require(!game.isCompleted, "Game is already completed");
        require(block.timestamp >= game.endTime, "Game has not ended yet");
        require(game.participantCount > 0, "No participants in the game");

        game.isActive = false;

        // Request randomness from Chainlink VRF
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        requestIdToGameId[requestId] = _gameId;

        emit RandomnessRequested(requestId, _gameId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 gameId = requestIdToGameId[requestId];
        require(gameId > 0, "Invalid request ID");

        Game storage game = games[gameId];
        require(!game.isCompleted, "Game already completed");

        uint256 randomNumber = randomWords[0];
        uint256 winnerIndex = randomNumber % game.participantCount;

        address winner = gameParticipants[gameId][winnerIndex].user;
        uint256 prize = game.totalPrize;

        // Calculate platform fee
        uint256 fee = (prize * platformFee) / 10000;
        uint256 winnerPrize = prize - fee;

        game.winner = winner;
        game.isCompleted = true;
        game.drawTxHash = uint256(keccak256(abi.encodePacked(requestId, randomNumber)));

        // Transfer prize to winner
        payable(winner).transfer(winnerPrize);

        // Transfer fee to owner
        if (fee > 0) {
            payable(owner()).transfer(fee);
        }

        emit GameDrawn(gameId, winner, winnerPrize);
    }

    // View functions
    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }

    function getGameParticipants(uint256 _gameId) external view returns (Participant[] memory) {
        return gameParticipants[_gameId];
    }

    function getUserGames(address _user) external view returns (uint256[] memory) {
        return userGames[_user];
    }

    function getActiveGames() external view returns (uint256[] memory) {
        uint256[] memory activeGames = new uint256[](gameCounter);
        uint256 count = 0;

        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].isActive && !games[i].isCompleted) {
                activeGames[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeGames[i];
        }

        return result;
    }

    // Admin functions
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee cannot exceed 10%"); // Max 10% in basis points
        platformFee = _fee;
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

