// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

/**
 * @title FreshChainV2
 * @dev Supply Chain Tracking with Escrow, Expiry Control, and Emergency Stop features.
 */
contract FreshChainV2 {
    
    // --- Data Structures ---
    
    struct SensorLog {
        uint256 timestamp;
        int256 temperature;
        int256 humidity;
        string location;
        address recordedBy;
    }

    struct Batch {
        uint256 batchId;
        string productName;
        uint256 quantity;
        uint256 expiryDate;      // FEATURE: Product Expiration Control
        uint256 collateral;      // FEATURE: Escrow (Collateral) Amount
        address currentOwner;
        address producer; 
        bool isFinalized; 
        bool passedInspection;
        bool isViolated;         // Quality violation flag
        SensorLog[] sensorLogs;
        address[] ownershipHistory; 
    }

    // --- State Variables ---
    address public admin; 
    bool public paused = false; // FEATURE: Emergency Stop
    
    mapping(uint256 => Batch) public batches;
    mapping(uint256 => bool) public batchExists;
    
    // Role Mappings
    mapping(address => bool) public producers;
    mapping(address => bool) public transporters;
    mapping(address => bool) public distributors;
    mapping(address => bool) public retailers;

    // --- Events ---
    event BatchCreated(uint256 indexed batchId, string productName, uint256 quantity, address indexed producer);
    event SensorDataAdded(uint256 indexed batchId, int256 temp, int256 humidity, string location, uint256 timestamp, bool isViolated);
    event OwnershipTransferred(uint256 indexed batchId, address indexed previousOwner, address indexed newOwner);
    event BatchFinalized(uint256 indexed batchId, bool passedInspection);
    event PenaltyEnforced(uint256 indexed batchId, uint256 amount, string reason);
    event EmergencyStatusChanged(bool isPaused);

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(msg.sender == admin, "Restricted: Admin only");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is currently paused for emergency");
        _;
    }

    modifier onlyProducer() {
        require(producers[msg.sender], "Unauthorized: Not a registered Producer");
        _;
    }
    
    modifier onlyActor() {
        require(
            producers[msg.sender] || transporters[msg.sender] || 
            distributors[msg.sender] || retailers[msg.sender], 
            "Unauthorized: Not a registered Actor"
        );
        _;
    }

    modifier onlyTransporter() {
        require(transporters[msg.sender], "Unauthorized: Not a registered Transporter");
        _;
    }

    modifier onlyRetailer() {
        require(retailers[msg.sender], "Unauthorized: Not a registered Retailer");
        _;
    }

    // --- Constructor ---
    constructor() {
        admin = msg.sender; 
    }

    // --- 1. Role Registration (Admin Only) ---

    function togglePause() external onlyAdmin {
        paused = !paused;
        emit EmergencyStatusChanged(paused);
    }

    function registerProducer(address _producer) external onlyAdmin {
        producers[_producer] = true;
    }

    function registerTransporter(address _transporter) external onlyAdmin {
        transporters[_transporter] = true;
    }

    function registerDistributor(address _distributor) external onlyAdmin {
        distributors[_distributor] = true;
    }

    function registerRetailer(address _retailer) external onlyAdmin {
        retailers[_retailer] = true;
    }

    // --- 2. Production ---

    function createBatch(
        uint256 _batchId, 
        string memory _productName, 
        uint256 _quantity, 
        uint256 _daysToExpiry
    ) 
        external 
        onlyProducer 
        whenNotPaused 
    {
        require(!batchExists[_batchId], "Error: Batch ID already exists");
        require(_quantity > 0, "Error: Quantity must be greater than zero");

        Batch storage b = batches[_batchId];
        b.batchId = _batchId;
        b.productName = _productName;
        b.quantity = _quantity;
        b.expiryDate = block.timestamp + (_daysToExpiry * 1 days);
        b.currentOwner = msg.sender;
        b.producer = msg.sender;
        b.isFinalized = false;
        b.isViolated = false; 
        
        b.ownershipHistory.push(msg.sender);
        batchExists[_batchId] = true;

        emit BatchCreated(_batchId, _productName, _quantity, msg.sender);
    }

    // --- 3. Environmental Tracking & Automated Penalty ---

    function addSensorData(
        uint256 _batchId,
        int256 _temperature,
        int256 _humidity,
        string memory _location
    ) 
        external 
        onlyTransporter 
        whenNotPaused
    {
        require(batchExists[_batchId], "Error: Batch does not exist");
        Batch storage b = batches[_batchId];
        require(b.currentOwner == msg.sender, "Unauthorized: Not the current holder");
        require(block.timestamp < b.expiryDate, "ALARM: Product has expired!");

        // Quality Thresholds
        require(_temperature >= -10 && _temperature <= 40, "Value Error: Temperature out of range");
        require(_humidity >= 0 && _humidity <= 40, "Value Error: Humidity out of range");

        // AUTOMATED PENALTY LOGIC
        if (_temperature > 25 && b.collateral > 0) {
            b.isViolated = true;
            uint256 penalty = b.collateral;
            b.collateral = 0;
            
            // Transfer collateral to Producer as compensation
            (bool success, ) = payable(b.producer).call{value: penalty}("");
            require(success, "Penalty transfer failed");
            
            emit PenaltyEnforced(_batchId, penalty, "Critical: High Temperature Breach");
        }
        
        b.sensorLogs.push(
            SensorLog({
                recordedBy: msg.sender,
                temperature: _temperature,
                humidity: _humidity,
                location: _location,
                timestamp: block.timestamp 
            })
        );

        emit SensorDataAdded(_batchId, _temperature, _humidity, _location, block.timestamp, b.isViolated); 
    }

    // --- 4. NEW: Pull-Based Ownership Transfer ---
    
    /**
     * @dev Allows an authorized Actor to claim ownership.
     * If the caller is a Transporter, they MUST deposit collateral.
     */
    function transferOwnership(uint256 _batchId, address _newOwner) external payable onlyActor whenNotPaused {
        require(batchExists[_batchId], "Error: Batch does not exist");
        Batch storage b = batches[_batchId];
        require(!b.isFinalized, "Error: Cannot transfer a finalized batch");
        require(block.timestamp < b.expiryDate, "Error: Product has expired");

        // Logic A: The CURRENT OWNER wants to push to someone else
        if (b.currentOwner == msg.sender) {
            // Standard transfer: Owner gives it to _newOwner
            b.currentOwner = _newOwner;
        } 
        // Logic B: A TRANSPORTER wants to "Take/Claim" the batch from someone else
        else if (transporters[msg.sender] && _newOwner == msg.sender) {
            require(msg.value >= 0.0001 ether, "Escrow Error: Collateral required to claim");
            b.collateral = msg.value;
            b.currentOwner = msg.sender;
        } 
        else {
            revert("Unauthorized: You do not own this batch or cannot claim it");
        }

        b.ownershipHistory.push(b.currentOwner);
        emit OwnershipTransferred(_batchId, msg.sender, b.currentOwner);
    }

    // --- 5. Delivery Finalization ---

    function markAsArrived(uint256 _batchId, bool _passedInspection) external onlyRetailer whenNotPaused {
        require(batchExists[_batchId], "Error: Batch does not exist");
        Batch storage b = batches[_batchId];
        require(b.currentOwner == msg.sender, "Unauthorized: Retailer must be the current holder");
        require(!b.isFinalized, "Error: Batch is already finalized");

        b.isFinalized = true;
        b.passedInspection = _passedInspection;

        // REFUND LOGIC: If no violation, refund the Transporter (index 1 in history)
        if (!b.isViolated && b.collateral > 0) {
            uint256 refund = b.collateral;
            b.collateral = 0;
            // Transfer back to the first transporter in history
            (bool success, ) = payable(b.ownershipHistory[1]).call{value: refund}("");
            require(success, "Refund transfer failed");
        }

        emit BatchFinalized(_batchId, _passedInspection);
    }

    // --- 6. Queries ---
    
    function getBatchHistory(uint256 _batchId) public view returns (
        string memory name,
        uint256 quantity,
        uint256 expiryDate,
        uint256 collateral,
        address producer,
        address currentOwner,
        bool isFinalized,
        bool passedInspection,
        bool isViolated, 
        address[] memory history,
        SensorLog[] memory logs
    ) {
        require(batchExists[_batchId], "Batch does not exist");
        Batch storage b = batches[_batchId];
        return (
            b.productName, b.quantity, b.expiryDate, b.collateral,
            b.producer, b.currentOwner, b.isFinalized, b.passedInspection,
            b.isViolated, b.ownershipHistory, b.sensorLogs
        );
    }
}