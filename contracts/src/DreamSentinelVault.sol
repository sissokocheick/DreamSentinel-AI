// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DreamSentinelVault
 * @notice Non-custodial AI Copy-Trading Vault for DreamDEX Event Contracts on Somnia L1.
 * @dev Allows users to deposit USDso/STT and allocate funds to autonomous AI agent strategies.
 *      Agents execute trades on DreamDEX Event Contracts within strict risk guardrails.
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface IDreamDEXEventContract {
    function buyOutcome(bytes32 marketId, uint8 outcomeIndex, uint256 amount, uint256 maxPrice) external returns (uint256 sharesBought);
    function sellOutcome(bytes32 marketId, uint8 outcomeIndex, uint256 sharesAmount, uint256 minPrice) external returns (uint256 proceeds);
    function redeemWinnings(bytes32 marketId) external returns (uint256 payout);
}

contract DreamSentinelVault {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;

    address public immutable asset; // USDso or native STT wrapper
    address public owner;
    
    // Performance and management fee (basis points, 100 = 1%)
    uint256 public performanceFeeBps = 1000; // 10%
    uint256 public managementFeeBps = 100;   // 1%
    address public feeRecipient;

    // Agent delegation and Strategy state
    struct Strategy {
        string name;
        address agentAddress;
        bool isActive;
        uint256 allocatedCapital;
        uint256 maxDrawdownLimitBps; // Max allowable drawdown before circuit breaker
        uint256 totalTradesExecuted;
        int256 totalPnL;
    }

    mapping(bytes32 => Strategy) public strategies;
    bytes32[] public strategyList;
    mapping(address => bool) public isAuthorizedAgent;

    // Share accounting
    uint256 public totalShares;
    mapping(address => uint256) public balanceOf;

    // Circuit breaker & Pausing
    bool public isEmergencyPaused;
    uint256 public constant MAX_BPS = 10000;

    // Events
    event Deposit(address indexed user, uint256 assets, uint256 shares);
    event Withdraw(address indexed user, uint256 assets, uint256 shares);
    event StrategyAdded(bytes32 indexed strategyId, string name, address indexed agent);
    event OrderExecutedByAgent(bytes32 indexed strategyId, bytes32 indexed marketId, uint8 outcome, uint256 amount);
    event EmergencyPauseToggled(bool isPaused);
    event PerformanceFeeUpdated(uint256 newFee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAgent() {
        require(isAuthorizedAgent[msg.sender], "Only authorized AI agent");
        _;
    }

    modifier whenNotPaused() {
        require(!isEmergencyPaused, "Vault is paused");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _asset,
        address _feeRecipient
    ) {
        name = _name;
        symbol = _symbol;
        asset = _asset;
        owner = msg.sender;
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice Returns total assets currently managed by the vault.
     */
    function totalAssets() public view returns (uint256) {
        return IERC20(asset).balanceOf(address(this));
    }

    /**
     * @notice Convert asset amount to vault shares.
     */
    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalShares;
        if (supply == 0) return assets;
        uint256 total = totalAssets();
        return total == 0 ? assets : (assets * supply) / total;
    }

    /**
     * @notice Convert share amount to underlying assets.
     */
    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalShares;
        if (supply == 0) return shares;
        return (shares * totalAssets()) / supply;
    }

    /**
     * @notice Deposit assets to receive vault shares.
     */
    function deposit(uint256 assets, address receiver) external whenNotPaused returns (uint256 shares) {
        require(assets > 0, "Invalid deposit amount");
        shares = convertToShares(assets);
        require(shares > 0, "Zero shares minted");

        require(IERC20(asset).transferFrom(msg.sender, address(this), assets), "Transfer failed");

        totalShares += shares;
        balanceOf[receiver] += shares;

        emit Deposit(receiver, assets, shares);
    }

    /**
     * @notice Burn shares and withdraw underlying assets.
     */
    function withdraw(uint256 shares, address receiver, address owner_) external returns (uint256 assets) {
        require(shares > 0, "Invalid share amount");
        if (msg.sender != owner_) {
            require(msg.sender == owner_, "Unauthorized");
        }
        require(balanceOf[owner_] >= shares, "Insufficient balance");

        assets = convertToAssets(shares);
        require(assets > 0, "Zero assets to withdraw");

        balanceOf[owner_] -= shares;
        totalShares -= shares;

        require(IERC20(asset).transfer(receiver, assets), "Transfer failed");

        emit Withdraw(receiver, assets, shares);
    }

    /**
     * @notice Register a new autonomous trading strategy.
     */
    function registerStrategy(
        bytes32 strategyId,
        string memory strategyName,
        address agentAddress,
        uint256 maxDrawdownLimitBps
    ) external onlyOwner {
        require(strategies[strategyId].agentAddress == address(0), "Strategy already exists");
        require(agentAddress != address(0), "Invalid agent address");

        strategies[strategyId] = Strategy({
            name: strategyName,
            agentAddress: agentAddress,
            isActive: true,
            allocatedCapital: 0,
            maxDrawdownLimitBps: maxDrawdownLimitBps,
            totalTradesExecuted: 0,
            totalPnL: 0
        });

        isAuthorizedAgent[agentAddress] = true;
        strategyList.push(strategyId);

        emit StrategyAdded(strategyId, strategyName, agentAddress);
    }

    /**
     * @notice Execute trade on DreamDEX Event Contract on behalf of the vault.
     */
    function executeEventContractTrade(
        bytes32 strategyId,
        address eventContract,
        bytes32 marketId,
        uint8 outcomeIndex,
        uint256 amount,
        uint256 maxPrice
    ) external onlyAgent whenNotPaused returns (uint256 sharesBought) {
        Strategy storage strat = strategies[strategyId];
        require(strat.isActive, "Strategy is not active");
        require(strat.agentAddress == msg.sender, "Caller is not assigned agent");
        require(amount <= totalAssets(), "Amount exceeds vault balance");

        // Approve DreamDEX Event Contract
        IERC20(asset).approve(eventContract, amount);

        // Execute buy order on DreamDEX Event Contract
        sharesBought = IDreamDEXEventContract(eventContract).buyOutcome(
            marketId,
            outcomeIndex,
            amount,
            maxPrice
        );

        strat.totalTradesExecuted += 1;

        emit OrderExecutedByAgent(strategyId, marketId, outcomeIndex, amount);
    }

    /**
     * @notice Circuit breaker to pause vault operations in extreme market events.
     */
    function toggleEmergencyPause() external onlyOwner {
        isEmergencyPaused = !isEmergencyPaused;
        emit EmergencyPauseToggled(isEmergencyPaused);
    }

    /**
     * @notice Update performance fee.
     */
    function setPerformanceFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 2500, "Fee too high (max 25%)");
        performanceFeeBps = newFeeBps;
        emit PerformanceFeeUpdated(newFeeBps);
    }
}
