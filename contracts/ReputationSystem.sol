// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationSystem is Ownable {
    struct UserReputation {
        uint256 score;
        uint256 gamesPlayed;
        uint256 gamesWon;
        uint256 loansGiven;
        uint256 loansRepaid;
        uint256 loansDefaulted;
        uint256 lastActivity;
        bool isActive;
    }

    mapping(address => UserReputation) public userReputations;
    mapping(address => bool) public authorizedContracts;

    uint256 public constant MAX_REPUTATION_SCORE = 2500;
    uint256 public constant MIN_REPUTATION_SCORE = 0;

    // Reputation point allocations
    uint256 public constant GAME_PARTICIPATION_POINTS = 10;
    uint256 public constant GAME_WIN_POINTS = 50;
    uint256 public constant LOAN_REPAYMENT_POINTS = 25;
    uint256 public constant LOAN_DEFAULT_PENALTY = 100;

    event ReputationUpdated(address indexed user, uint256 newScore, string reason);
    event ContractAuthorized(address indexed contractAddress);
    event ContractDeauthorized(address indexed contractAddress);

    constructor() {
        // Initialize with some default values if needed
    }

    modifier onlyAuthorizedContract() {
        require(authorizedContracts[msg.sender], "Unauthorized contract");
        _;
    }

    function authorizeContract(address _contract) external onlyOwner {
        authorizedContracts[_contract] = true;
        emit ContractAuthorized(_contract);
    }

    function deauthorizeContract(address _contract) external onlyOwner {
        authorizedContracts[_contract] = false;
        emit ContractDeauthorized(_contract);
    }

    function recordGameParticipation(address _user) external onlyAuthorizedContract {
        UserReputation storage rep = userReputations[_user];
        rep.gamesPlayed++;
        rep.lastActivity = block.timestamp;
        rep.isActive = true;

        _updateReputationScore(_user, GAME_PARTICIPATION_POINTS, "Game participation");
    }

    function recordGameWin(address _user) external onlyAuthorizedContract {
        UserReputation storage rep = userReputations[_user];
        rep.gamesWon++;
        rep.lastActivity = block.timestamp;

        _updateReputationScore(_user, GAME_WIN_POINTS, "Game win");
    }

    function recordLoanRepayment(address _user) external onlyAuthorizedContract {
        UserReputation storage rep = userReputations[_user];
        rep.loansRepaid++;
        rep.lastActivity = block.timestamp;

        _updateReputationScore(_user, LOAN_REPAYMENT_POINTS, "Loan repayment");
    }

    function recordLoanDefault(address _user) external onlyAuthorizedContract {
        UserReputation storage rep = userReputations[_user];
        rep.loansDefaulted++;
        rep.lastActivity = block.timestamp;

        _updateReputationScore(_user, -int256(LOAN_DEFAULT_PENALTY), "Loan default");
    }

    function recordLoanGiven(address _user) external onlyAuthorizedContract {
        UserReputation storage rep = userReputations[_user];
        rep.loansGiven++;
        rep.lastActivity = block.timestamp;

        _updateReputationScore(_user, 5, "Loan given"); // Smaller points for lending
    }

    function _updateReputationScore(address _user, int256 _points, string memory _reason) internal {
        UserReputation storage rep = userReputations[_user];

        if (_points > 0) {
            if (rep.score + uint256(_points) > MAX_REPUTATION_SCORE) {
                rep.score = MAX_REPUTATION_SCORE;
            } else {
                rep.score += uint256(_points);
            }
        } else {
            if (rep.score < uint256(-_points)) {
                rep.score = MIN_REPUTATION_SCORE;
            } else {
                rep.score -= uint256(-_points);
            }
        }

        emit ReputationUpdated(_user, rep.score, _reason);
    }

    function getReputationLevel(uint256 _score) public pure returns (string memory) {
        if (_score >= 2500) return "Diamond";
        if (_score >= 1000) return "Platinum";
        if (_score >= 500) return "Gold";
        if (_score >= 100) return "Silver";
        return "Bronze";
    }

    function getReputationColor(uint256 _score) public pure returns (string memory) {
        if (_score >= 2500) return "#B9F2FF"; // Cyan
        if (_score >= 1000) return "#E5E4E2"; // Platinum
        if (_score >= 500) return "#FFD700";  // Gold
        if (_score >= 100) return "#C0C0C0";  // Silver
        return "#CD7F32"; // Bronze
    }

    function getUserReputation(address _user) external view returns (UserReputation memory) {
        return userReputations[_user];
    }

    function getReputationScore(address _user) external view returns (uint256) {
        return userReputations[_user].score;
    }

    function getReputationLevel(address _user) external view returns (string memory) {
        return getReputationLevel(userReputations[_user].score);
    }

    function isUserActive(address _user) external view returns (bool) {
        UserReputation memory rep = userReputations[_user];
        return rep.isActive && (block.timestamp - rep.lastActivity) < 365 days;
    }

    function getTopReputedUsers(uint256 _limit) external view returns (address[] memory, uint256[] memory) {
        // This is a simplified implementation. In production, you'd want a more efficient way
        // to track top users, perhaps using a heap or sorted list
        address[] memory users = new address[](_limit);
        uint256[] memory scores = new uint256[](_limit);

        // For now, return empty arrays as this would require more complex data structures
        return (users, scores);
    }

    // Admin functions
    function setReputationPoints(
        uint256 _gameParticipation,
        uint256 _gameWin,
        uint256 _loanRepayment,
        uint256 _loanDefaultPenalty
    ) external onlyOwner {
        // In a real implementation, you'd store these as state variables
        // and use them in the update functions
    }

    function resetUserReputation(address _user) external onlyOwner {
        delete userReputations[_user];
    }

    function emergencyUpdateReputation(address _user, uint256 _newScore) external onlyOwner {
        require(_newScore <= MAX_REPUTATION_SCORE, "Score exceeds maximum");
        userReputations[_user].score = _newScore;
        emit ReputationUpdated(_user, _newScore, "Emergency update");
    }
}

