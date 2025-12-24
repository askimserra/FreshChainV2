# FreshChainV2: Blockchain-Based Supply Chain Management

FreshChainV2 is a decentralized application (DApp) designed to provide end-to-end transparency, real-time quality monitoring, and automated security in the food supply chain. Built on the Ethereum blockchain, it ensures that every step of a product's journey from producer to customer is immutable and verifiable.

---

## Key Features

* **Role-Based Access Control:** Distinct interfaces and permissions for Producers, Transporters, Distributors, and Retailers.

* **Emergency Stop (Circuit Breaker):** A master security switch controlled by the Admin to freeze system operations during security breaches or maintenance.

* **Automated Quality Policing:** Smart contracts automatically detect environmental violations (e.g., temperature spikes) and execute instant financial penalties.

* **Real-Time Tracking:** A public-facing Customer Portal for instant product history and safety verification using Batch IDs.

---

## Technical Architecture

The system follows a decentralized three-tier architecture:

1. **Frontend (React and Ethers.js):** A responsive UI that interacts with the blockchain via Ethers.js v6.

2. **Provider Layer (MetaMask):** Acts as the secure bridge for transaction signing and network connectivity.

3. **Smart Contract Layer (Solidity):** The core engine deployed on an EVM-compatible network, managing state variables like isPaused and isViolated.

---

## Project Structure

```text
FreshChainV2/
├── contracts/             # Solidity Smart Contracts (Core Logic)
├── src/
│   ├── components/        # Frontend UI Components
│   │   ├── Admin.js       # Role Management and Emergency Stop
│   │   ├── Customer.js    # Public Tracking and History Portal
│   │   └── ...            # Producer, Transporter, Retailer views
│   ├── config.js          # Contract Address and ABI (The Bridge)
│   └── App.js             # Main Routing and Navigation
├── docs/                  # Project Documentation (Word/PDF reports)
└── README.md              # Project overview and setup