import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const Customer = () => {
    const [id, setId] = useState("");
    const [data, setData] = useState(null);
    const [status, setStatus] = useState("");
    const [isPaused, setIsPaused] = useState(false);

    // Initialize provider and contract
    const getContract = async () => {
        if (!window.ethereum) throw new Error("MetaMask not found! Please use MetaMask mobile browser.");
        const provider = new ethers.BrowserProvider(window.ethereum);
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    };

    // Check system status (Paused/Active) on load
    const checkStatus = async () => {
        try {
            const contract = await getContract();
            const pausedState = await contract.paused();
            setIsPaused(pausedState);
        } catch (err) {
            console.error("Status Check Error:", err);
        }
    };

    useEffect(() => {
        checkStatus();
        // Optional: refresh status every 30 seconds
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchHistory = async () => {
        try {
            setStatus("🔍 Searching Blockchain...");
            setData(null);
            
            const contract = await getContract();
            
            // Security Check: Verify if system is paused before execution
            const currentPauseStatus = await contract.paused();
            if (currentPauseStatus) {
                setIsPaused(true);
                setStatus("🚨 ACCESS DENIED: System is currently locked for maintenance.");
                return;
            }

            const res = await contract.getBatchHistory(id);
            console.log("Raw Data:", res);

            setData({
                name: res[0],
                qty: res[1].toString(),
                expiry: new Date(Number(res[2]) * 1000).toLocaleDateString(),
                collateral: ethers.formatEther(res[3]),
                producer: res[4],
                isFinalized: res[6],
                violation: res[8],
                logs: res[10]
            });
            setStatus("✅ Record Found");
        } catch (err) {
            console.error(err);
            setStatus("❌ Batch ID not found or network error.");
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={{ color: "#1565c0" }}>🔎 Trace Your Product</h2>
            
            {/* Emergency Stop Banner */}
            {isPaused && (
                <div style={styles.emergencyBanner}>
                    <strong>🚨 SYSTEM MAINTENANCE</strong>
                    <p style={{ margin: "5px 0 0 0", fontSize: "0.8em" }}>
                        Tracking services are temporarily disabled by the administrator.
                    </p>
                </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
                <input 
                    type="number" 
                    placeholder="Enter Batch ID (e.g. 200)" 
                    onChange={e => setId(e.target.value)} 
                    style={styles.input} 
                    disabled={isPaused}
                />
                <button 
                    onClick={fetchHistory} 
                    style={{ ...styles.button, backgroundColor: isPaused ? "#90a4ae" : "#1565c0" }}
                    disabled={isPaused}
                >
                    {isPaused ? "LOCKED" : "TRACK"}
                </button>
            </div>
            
            {status && <p style={{ fontSize: "0.85em", color: "#555", marginTop: "10px" }}>{status}</p>}

            {data && !isPaused && (
                <div style={styles.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0 }}>📦 {data.name}</h3>
                        <span style={{
                            padding: "5px 12px",
                            borderRadius: "15px",
                            backgroundColor: data.isFinalized ? "#e8f5e9" : "#fff3e0",
                            color: data.isFinalized ? "#2e7d32" : "#ef6c00",
                            fontSize: "0.75em",
                            fontWeight: "bold"
                        }}>
                            {data.isFinalized ? "DELIVERED" : "IN TRANSIT"}
                        </span>
                    </div>
                    
                    <div style={styles.infoRow}>
                        <p><strong>Expiry Date:</strong> {data.expiry}</p>
                        <p><strong>Safety Status:</strong> 
                            <span style={{ color: data.violation ? "#d32f2f" : "#2e7d32", fontWeight: "bold" }}>
                                {data.violation ? " 🚨 VIOLATION DETECTED" : " 🟢 PERFECT CONDITION"}
                            </span>
                        </p>
                        <p><strong>Collateral in Escrow:</strong> {data.collateral} ETH</p>
                    </div>
                    
                    <hr style={{ border: "0.5px solid #eee", margin: "20px 0" }} />
                    
                    <h4>🌡️ Sensor History (Audit Trail)</h4>
                    <div style={styles.logContainer}>
                        {data.logs.length > 0 ? (
                            data.logs.map((log, i) => (
                                <div key={i} style={styles.logItem}>
                                    <strong>🕒 {new Date(Number(log[0]) * 1000).toLocaleTimeString()}</strong>
                                    <br />
                                    <span style={{ color: "#1565c0", fontWeight: "500" }}>
                                        🌡️ {log[1].toString()}°C / 💧 {log[2].toString()}% Humidity
                                    </span>
                                    <br />
                                    <small style={{ color: "#777" }}>📍 Location: {log[3]}</small>
                                </div>
                            ))
                        ) : (
                            <p style={{ fontSize: "0.8em", color: "#999" }}>No sensor logs recorded yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { maxWidth: "550px", margin: "40px auto", padding: "20px", textAlign: "center", fontFamily: "'Inter', sans-serif" },
    input: { padding: "12px", flex: 1, borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" },
    button: { padding: "12px 25px", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: "0.3s" },
    emergencyBanner: { backgroundColor: "#ffebee", color: "#c62828", padding: "15px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #ffcdd2" },
    card: { textAlign: "left", marginTop: "25px", padding: "25px", borderRadius: "15px", backgroundColor: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
    infoRow: { marginTop: "15px", fontSize: "0.95em", lineHeight: "1.8" },
    logContainer: { maxHeight: "300px", overflowY: "auto", paddingRight: "10px" },
    logItem: { fontSize: "0.85em", padding: "12px", borderBottom: "1px solid #f0f0f0", marginBottom: "5px", backgroundColor: "#fafafa", borderRadius: "5px" }
};

export default Customer;