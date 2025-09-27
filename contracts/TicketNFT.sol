// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TicketNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct TicketMetadata {
        uint256 gameId;
        uint256 entryTime;
        string gameType;
        uint256 entryFee;
        bool isWinner;
        uint256 prizeAmount;
    }

    mapping(uint256 => TicketMetadata) public ticketMetadata;
    mapping(uint256 => address) public gameContracts; // Authorized game contracts

    event TicketMinted(uint256 indexed tokenId, address indexed owner, uint256 indexed gameId);
    event TicketUpdated(uint256 indexed tokenId, bool isWinner, uint256 prizeAmount);

    constructor() ERC721("FairPlay Nexus Ticket", "FPNT") {}

    function mintTicket(
        address _to,
        uint256 _gameId,
        string memory _gameType,
        uint256 _entryFee,
        string memory _tokenURI
    ) external returns (uint256) {
        // Only authorized game contracts can mint tickets
        require(gameContracts[_gameId] == msg.sender, "Unauthorized to mint tickets for this game");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _mint(_to, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        ticketMetadata[tokenId] = TicketMetadata({
            gameId: _gameId,
            entryTime: block.timestamp,
            gameType: _gameType,
            entryFee: _entryFee,
            isWinner: false,
            prizeAmount: 0
        });

        emit TicketMinted(tokenId, _to, _gameId);

        return tokenId;
    }

    function updateTicketResult(uint256 _tokenId, bool _isWinner, uint256 _prizeAmount) external {
        require(gameContracts[ticketMetadata[_tokenId].gameId] == msg.sender, "Unauthorized to update ticket");

        ticketMetadata[_tokenId].isWinner = _isWinner;
        ticketMetadata[_tokenId].prizeAmount = _prizeAmount;

        emit TicketUpdated(_tokenId, _isWinner, _prizeAmount);
    }

    function authorizeGameContract(uint256 _gameId, address _contract) external onlyOwner {
        gameContracts[_gameId] = _contract;
    }

    function getTicketMetadata(uint256 _tokenId) external view returns (TicketMetadata memory) {
        require(_exists(_tokenId), "Token does not exist");
        return ticketMetadata[_tokenId];
    }

    function getUserTickets(address _user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(_user);
        uint256[] memory tokens = new uint256[](balance);

        uint256 tokenCount = 0;
        for (uint256 i = 1; i <= _tokenIdCounter.current(); i++) {
            if (_exists(i) && ownerOf(i) == _user) {
                tokens[tokenCount] = i;
                tokenCount++;
            }
        }

        return tokens;
    }

    function getGameTickets(uint256 _gameId) external view returns (uint256[] memory) {
        uint256[] memory tokens = new uint256[](_tokenIdCounter.current());
        uint256 count = 0;

        for (uint256 i = 1; i <= _tokenIdCounter.current(); i++) {
            if (_exists(i) && ticketMetadata[i].gameId == _gameId) {
                tokens[count] = i;
                count++;
            }
        }

        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tokens[i];
        }

        return result;
    }

    // Override functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

