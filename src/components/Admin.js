import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const Admin = () => {
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("producer");
  const [status, setStatus] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to initialize the contract instance
  const getContract = async () => {
    if (!window.ethereum) throw new Error("MetaMask not found! Please use a crypto-enabled browser.");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  };

  // Fetch the current system status (Paused or Active) from the blockchain
  const fetchSystemStatus = async () => {
    try {
      const contract = await getContract();
      const pausedState = await contract.paused(); // Calling the 'paused' mapping/variable from contract
      setIsPaused(pausedState);
    } catch (err) {
      console.error("Error fetching system status:", err);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const registerUser = async (e) => {
    e.preventDefault();
    try {
      setStatus("⏳ Registering user on the blockchain...");
      const contract = await getContract();
      let tx;
      
      if (role === "producer") tx = await contract.registerProducer(address);
      else if (role === "transporter") tx = await contract.registerTransporter(address);
      else if (role === "distributor") tx = await contract.registerDistributor(address);
      else if (role === "retailer") tx = await contract.registerRetailer(address);
      
      await tx.wait();
      setStatus(`✅ ${role.toUpperCase()} authorized successfully!`);
      setAddress(""); 
    } catch (err) {
      setStatus("❌ Error: Admin rights required or user already registered.");
    }
  };

  const toggleSystemPause = async () => {
    try {
      setIsLoading(true);
      setStatus("⏳ Sending Emergency Transaction...");
      const contract = await getContract();
      const tx = await contract.togglePause();
      await tx.wait();
      
      // Refresh status after transaction
      const updatedStatus = await contract.paused();
      setIsPaused(updatedStatus);
      setStatus(updatedStatus ? "🚨 SYSTEM PAUSED SUCCESSFULLY" : "✅ SYSTEM REACTIVATED");
    } catch (err) {
      setStatus("❌ Error: Action denied. Only the Contract Owner can toggle security pause.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ color: "#d32f2f", textAlign: "center" }}>🛠️ Admin Control Center</h2>
      
      {/* Emergency Stop Section */}
      <div style={{...styles.emergencyBox, borderColor: isPaused ? "#ff1744" : "#000"}}>
        <h4 style={{marginTop:0}}>System Security (Emergency Stop)</h4>
        <p style={{fontSize: "0.85em", color: "#555"}}>
          Current Status: <strong>{isPaused ? "🔴 PAUSED" : "🟢 ACTIVE"}</strong>
        </p>
        <button 
          onClick={toggleSystemPause} 
          disabled={isLoading}
          style={{
            ...styles.pauseBtn, 
            backgroundColor: isPaused ? "#2e7d32" : "#d32f2f" // Green if paused (to resume), Red if active (to stop)
          }}
        >
          {isLoading ? "PROCESSING..." : isPaused ? "UNPAUSE SYSTEM" : "ACTIVATE EMERGENCY STOP"}
        </button>
      </div>

      {/* Role Management Form */}
      <form onSubmit={registerUser} style={styles.form}>
        <h3>Role Management</h3>
        <label style={styles.label}>Wallet Address</label>
        <input 
          type="text" 
          placeholder="0x..." 
          value={address} 
          onChange={e => setAddress(e.target.value)} 
          required 
          style={styles.input} 
        />
        
        <label style={styles.label}>Assign Role</label>
        <select value={role} onChange={e => setRole(e.target.value)} style={styles.input}>
          <option value="producer">Producer</option>
          <option value="transporter">Transporter</option>
          <option value="distributor">Distributor</option>
          <option value="retailer">Retailer</option>
        </select>
        
        <button type="submit" style={styles.button} disabled={isPaused}>
          {isPaused ? "SYSTEM PAUSED" : "AUTHORIZE ROLE"}
        </button>
      </form>

      {status && (
        <div style={{
          ...styles.statusBox, 
          backgroundColor: status.includes("❌") ? "#ffebee" : "#e8f5e9"
        }}>
          {status}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: "500px", margin: "40px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "12px", backgroundColor: "#fdf2f2", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  label: { fontSize: "0.9em", fontWeight: "bold", marginBottom: "-5px" },
  input: { padding: "12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1em" },
  button: { padding: "12px", backgroundColor: "#d32f2f", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", transition: "0.3s" },
  pauseBtn: { width: "100%", padding: "12px", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", letterSpacing: "1px" },
  emergencyBox: { padding: "15px", border: "2px solid", borderRadius: "8px", marginBottom: "20px", backgroundColor: "#fff" },
  statusBox: { marginTop: "20px", padding: "15px", borderRadius: "6px", border: "1px solid #ddd", textAlign: "center", fontWeight: "500" }
};

export default Admin;