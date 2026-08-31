// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockDreamDEXEventContract
 * @notice Test mock replicating DreamDEX Central Limit Order Book & Binary Event Settlements on Somnia Shannon Testnet.
 */
contract MockDreamDEXEventContract {
    struct Market {
        string title;
        uint256 expiryTimestamp;
        bool isResolved;
        uint8 winningOutcome; // 0 = NO, 1 = YES
        uint256 totalVolume;
    }

    mapping(bytes32 => Market) public markets;
    mapping(bytes32 => mapping(address => mapping(uint8 => uint256))) public outcomeBalances;

    event MarketCreated(bytes32 indexed marketId, string title, uint256 expiry);
    event OutcomePurchased(bytes32 indexed marketId, address indexed buyer, uint8 outcome, uint256 amount, uint256 price);
    event MarketResolved(bytes32 indexed marketId, uint8 winningOutcome);

    function createMarket(bytes32 marketId, string memory title, uint256 durationSeconds) external {
        require(markets[marketId].expiryTimestamp == 0, "Market exists");
        markets[marketId] = Market({
            title: title,
            expiryTimestamp: block.timestamp + durationSeconds,
            isResolved: false,
            winningOutcome: 0,
            totalVolume: 0
        });
        emit MarketCreated(marketId, title, block.timestamp + durationSeconds);
    }

    function buyOutcome(
        bytes32 marketId,
        uint8 outcomeIndex,
        uint256 amount,
        uint256 maxPrice
    ) external returns (uint256 sharesBought) {
        Market storage m = markets[marketId];
        require(m.expiryTimestamp > block.timestamp, "Market expired");
        require(!m.isResolved, "Market resolved");
        require(outcomeIndex <= 1, "Invalid outcome (0=NO, 1=YES)");

        // 1 Share = 1 USDso if won, priced between 0.01 and 0.99
        uint256 effectivePrice = maxPrice > 0 ? maxPrice : 50e16; // 0.50 USDso default
        sharesBought = (amount * 1e18) / effectivePrice;

        outcomeBalances[marketId][msg.sender][outcomeIndex] += sharesBought;
        m.totalVolume += amount;

        emit OutcomePurchased(marketId, msg.sender, outcomeIndex, amount, effectivePrice);
    }

    function resolveMarket(bytes32 marketId, uint8 winningOutcome) external {
        Market storage m = markets[marketId];
        require(!m.isResolved, "Already resolved");
        m.isResolved = true;
        m.winningOutcome = winningOutcome;

        emit MarketResolved(marketId, winningOutcome);
    }

    function redeemWinnings(bytes32 marketId) external returns (uint256 payout) {
        Market storage m = markets[marketId];
        require(m.isResolved, "Not resolved yet");

        uint256 winningShares = outcomeBalances[marketId][msg.sender][m.winningOutcome];
        require(winningShares > 0, "No winning shares");

        outcomeBalances[marketId][msg.sender][m.winningOutcome] = 0;
        payout = winningShares; // 1:1 payout
    }
}
