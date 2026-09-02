// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DreamSentinelOracle
 * @author DreamSentinel AI Team
 * @notice On-chain Verifiable Bayesian Oracle & AI Signal Registry on Somnia L1.
 * @dev Stores immutable cryptographic snapshots of autonomous agent predictions,
 *      probability distributions, and tracks algorithmic accuracy on-chain.
 */
contract DreamSentinelOracle {
    struct Prediction {
        string marketId;
        string symbol;
        uint16 bayesianProbYesBps;    // e.g. 6420 = 64.20%
        uint16 marketImpliedProbBps;  // e.g. 5100 = 51.00%
        uint16 edgeBps;               // e.g. 1320 = 13.20%
        uint8 recommendedOutcome;     // 1 = YES, 0 = NO, 2 = HOLD
        uint16 confidenceBps;         // e.g. 8850 = 88.50%
        uint256 timestamp;
        bool isResolved;
        bool wasAccurate;
    }

    struct PredictionInput {
        string marketId;
        string symbol;
        uint16 bayesianProbYesBps;
        uint16 marketImpliedProbBps;
        uint16 edgeBps;
        uint8 recommendedOutcome;
        uint16 confidenceBps;
    }

    address public owner;
    mapping(address => bool) public authorizedAgents;

    // Latest prediction for each market
    mapping(string => Prediction) public latestPredictions;
    string[] public registeredMarkets;
    mapping(string => bool) private marketExists;

    // Global on-chain AI performance metrics
    uint256 public totalPredictionsPublished;
    uint256 public totalPredictionsResolved;
    uint256 public accuratePredictionsCount;

    // Events
    event PredictionAnchored(
        string indexed marketId,
        string symbol,
        uint16 bayesianProbYesBps,
        uint16 edgeBps,
        uint8 recommendedOutcome,
        uint256 timestamp
    );

    event PredictionResolved(
        string indexed marketId,
        uint8 actualWinningOutcome,
        bool wasAccurate,
        uint256 currentAccuracyBps
    );

    event AgentAuthorized(address indexed agent, bool status);

    modifier onlyAuthorized() {
        require(msg.sender == owner || authorizedAgents[msg.sender], "Not authorized AI agent");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedAgents[msg.sender] = true;
    }

    function setAgentAuthorization(address agent, bool status) external {
        require(msg.sender == owner, "Only owner");
        authorizedAgents[agent] = status;
        emit AgentAuthorized(agent, status);
    }

    /**
     * @notice Anchors an AI Swarm prediction snapshot directly onto the Somnia blockchain.
     */
    function publishPrediction(
        string calldata marketId,
        string calldata symbol,
        uint16 bayesianProbYesBps,
        uint16 marketImpliedProbBps,
        uint16 edgeBps,
        uint8 recommendedOutcome,
        uint16 confidenceBps
    ) external onlyAuthorized {
        latestPredictions[marketId] = Prediction({
            marketId: marketId,
            symbol: symbol,
            bayesianProbYesBps: bayesianProbYesBps,
            marketImpliedProbBps: marketImpliedProbBps,
            edgeBps: edgeBps,
            recommendedOutcome: recommendedOutcome,
            confidenceBps: confidenceBps,
            timestamp: block.timestamp,
            isResolved: false,
            wasAccurate: false
        });

        if (!marketExists[marketId]) {
            registeredMarkets.push(marketId);
            marketExists[marketId] = true;
        }

        totalPredictionsPublished++;

        emit PredictionAnchored(
            marketId,
            symbol,
            bayesianProbYesBps,
            edgeBps,
            recommendedOutcome,
            block.timestamp
        );
    }

    /**
     * @notice Batch publishes predictions to demonstrate Somnia's high TPS and sub-second finality.
     */
    function batchPublishPredictions(PredictionInput[] calldata inputs) external onlyAuthorized {
        for (uint256 i = 0; i < inputs.length; i++) {
            PredictionInput calldata item = inputs[i];
            latestPredictions[item.marketId] = Prediction({
                marketId: item.marketId,
                symbol: item.symbol,
                bayesianProbYesBps: item.bayesianProbYesBps,
                marketImpliedProbBps: item.marketImpliedProbBps,
                edgeBps: item.edgeBps,
                recommendedOutcome: item.recommendedOutcome,
                confidenceBps: item.confidenceBps,
                timestamp: block.timestamp,
                isResolved: false,
                wasAccurate: false
            });

            if (!marketExists[item.marketId]) {
                registeredMarkets.push(item.marketId);
                marketExists[item.marketId] = true;
            }

            totalPredictionsPublished++;

            emit PredictionAnchored(
                item.marketId,
                item.symbol,
                item.bayesianProbYesBps,
                item.edgeBps,
                item.recommendedOutcome,
                block.timestamp
            );
        }
    }

    /**
     * @notice Resolves a market outcome and computes verifiable on-chain algorithmic accuracy.
     */
    function resolvePrediction(string calldata marketId, uint8 actualWinningOutcome) external onlyAuthorized {
        Prediction storage pred = latestPredictions[marketId];
        require(bytes(pred.marketId).length > 0, "Prediction not found");
        require(!pred.isResolved, "Already resolved");

        pred.isResolved = true;
        bool accurate = (pred.recommendedOutcome == actualWinningOutcome);
        pred.wasAccurate = accurate;

        totalPredictionsResolved++;
        if (accurate) {
            accuratePredictionsCount++;
        }

        uint256 currentAccuracy = (accuratePredictionsCount * 10000) / totalPredictionsResolved;

        emit PredictionResolved(
            marketId,
            actualWinningOutcome,
            accurate,
            currentAccuracy
        );
    }

    /**
     * @notice Returns the verified on-chain win rate of the AI Swarm in basis points (10000 = 100%).
     */
    function getOnChainAccuracyScore() external view returns (uint256 accuracyBps, uint256 totalResolved, uint256 totalPublished) {
        if (totalPredictionsResolved == 0) {
            return (0, 0, totalPredictionsPublished);
        }
        return (
            (accuratePredictionsCount * 10000) / totalPredictionsResolved,
            totalPredictionsResolved,
            totalPredictionsPublished
        );
    }

    function getLatestPrediction(string calldata marketId) external view returns (Prediction memory) {
        return latestPredictions[marketId];
    }

    function getRegisteredMarketsCount() external view returns (uint256) {
        return registeredMarkets.length;
    }
}
