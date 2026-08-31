// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MockUSDso.sol";

/**
 * @title PvPDuelEscrow
 * @dev Smart contract for 60s PvP Duels on DreamDEX.
 * Escrows funds, registers predictions, and resolves outcomes via Sentinel Oracle.
 */
contract PvPDuelEscrow {
    MockUSDso public usdsoToken;
    address public oracleAddress;

    struct Duel {
        uint256 duelId;
        string assetSymbol;
        uint256 strikePrice; // 1e8 precision
        uint256 startTime;
        uint256 expiryTime;
        address playerYes;
        address playerNo;
        uint256 stakeAmount;
        bool resolved;
        address winner;
    }

    uint256 public nextDuelId;
    mapping(uint256 => Duel) public duels;

    event DuelCreated(uint256 indexed duelId, string assetSymbol, uint256 strikePrice, address creator, bool isCreatorYes, uint256 stakeAmount, uint256 expiryTime);
    event DuelMatched(uint256 indexed duelId, address opponent);
    event DuelResolved(uint256 indexed duelId, address winner, uint256 payout);

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Only oracle can resolve");
        _;
    }

    constructor(address _usdsoAddress) {
        usdsoToken = MockUSDso(_usdsoAddress);
        oracleAddress = msg.sender; // Deployer acts as oracle for demo
    }

    function createDuel(string memory _assetSymbol, uint256 _strikePrice, bool _isYes, uint256 _stakeAmount) external returns (uint256) {
        require(_stakeAmount > 0, "Stake must be > 0");
        require(usdsoToken.transferFrom(msg.sender, address(this), _stakeAmount), "Stake transfer failed");

        uint256 duelId = nextDuelId++;
        
        duels[duelId] = Duel({
            duelId: duelId,
            assetSymbol: _assetSymbol,
            strikePrice: _strikePrice,
            startTime: block.timestamp,
            expiryTime: block.timestamp + 60, // 60s micro-duel
            playerYes: _isYes ? msg.sender : address(0),
            playerNo: _isYes ? address(0) : msg.sender,
            stakeAmount: _stakeAmount,
            resolved: false,
            winner: address(0)
        });

        emit DuelCreated(duelId, _assetSymbol, _strikePrice, msg.sender, _isYes, _stakeAmount, duels[duelId].expiryTime);
        return duelId;
    }

    function joinDuel(uint256 _duelId) external {
        Duel storage duel = duels[_duelId];
        require(block.timestamp < duel.expiryTime, "Duel expired");
        require(duel.playerYes == address(0) || duel.playerNo == address(0), "Duel already matched");
        require(duel.playerYes != msg.sender && duel.playerNo != msg.sender, "Cannot play against self");

        require(usdsoToken.transferFrom(msg.sender, address(this), duel.stakeAmount), "Stake transfer failed");

        if (duel.playerYes == address(0)) {
            duel.playerYes = msg.sender;
        } else {
            duel.playerNo = msg.sender;
        }

        emit DuelMatched(_duelId, msg.sender);
    }

    function resolveDuel(uint256 _duelId, uint256 _finalPrice) external onlyOracle {
        Duel storage duel = duels[_duelId];
        require(!duel.resolved, "Already resolved");
        require(block.timestamp >= duel.expiryTime, "Duel not yet expired");
        require(duel.playerYes != address(0) && duel.playerNo != address(0), "Duel not matched");

        duel.resolved = true;
        
        bool isYesWinner = _finalPrice >= duel.strikePrice;
        duel.winner = isYesWinner ? duel.playerYes : duel.playerNo;
        
        uint256 totalPool = duel.stakeAmount * 2;
        uint256 fee = (totalPool * 1) / 100; // 1% fee for protocol
        uint256 payout = totalPool - fee;

        require(usdsoToken.transfer(duel.winner, payout), "Payout transfer failed");
        // Fee remains in contract (or could be sent to treasury)

        emit DuelResolved(_duelId, duel.winner, payout);
    }
}
