import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const Distributor = () => {
    const [batchId, setBatchId] = useState("");
    const [retailerAddr, setRetailerAddr] = useState("");
    const [status, setStatus] = useState("");
    const [activeWallet, setActiveWallet] = useState("");

    useEffect(() => {
        checkWallet();
    }, []);

    const checkWallet = async () => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setActiveWallet(address);
        }
    };

    const getContract = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    };

    // --- 1. MALI NAKLİYECİDEN DEVRALMA ---
    // Not: Bu butona basmadan önce Transporter'ın mülkiyeti size devretmiş olması gerekir.
    const handleCheckStatus = async () => {
        try {
            setStatus("⏳ Checking batch status...");
            const contract = await getContract();
            const batchInfo = await contract.getBatchHistory(Number(batchId));
            
            if (batchInfo.currentOwner.toLowerCase() === activeWallet.toLowerCase()) {
                setStatus("✅ You are the CURRENT OWNER of this batch.");
            } else {
                setStatus(`⚠️ Current Owner: ${batchInfo.currentOwner.slice(0,6)}... You need to be the owner to dispatch.`);
            }
        } catch (err) {
            setStatus("❌ Error: Batch not found.");
        }
    };

    // --- 2. RETAILER'A (MARKETE) TRANSFER ETME ---
    const handleTransferToRetailer = async (e) => {
        e.preventDefault();
        if (!retailerAddr) return alert("Please enter Retailer Address!");

        try {
            setStatus("⏳ Transferring ownership to Retailer...");
            const contract = await getContract();
            
            // Mevcut sahibi siz olduğunuz için mülkiyeti devrediyoruz
            const tx = await contract.transferOwnership(Number(batchId), retailerAddr);
            await tx.wait();
            
            setStatus(`🚀 Success! Batch #${batchId} sent to Retailer.`);
            setRetailerAddr("");
        } catch (err) {
            console.error(err);
            setStatus(`❌ Transfer Failed: ${err.reason || "Are you the owner and registered as Distributor?"}`);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={{color: "#0277bd", borderBottom: "2px solid #0277bd", paddingBottom: "10px"}}>
                🏢 Distribution Center Dashboard
            </h2>
            
            <div style={styles.infoBox}>
                <strong>Active Wallet:</strong> {activeWallet || "Connecting..."}
            </div>

            {/* BÖLÜM 1: MÜLKİYET KONTROLÜ */}
            <div style={styles.card}>
                <h4>📦 Step 1: Stock Check</h4>
                <div style={styles.inputGroup}>
                    <input 
                        type="number" 
                        placeholder="Enter Batch ID" 
                        value={batchId} 
                        onChange={e => setBatchId(e.target.value)} 
                        style={styles.input} 
                    />
                    <button onClick={handleCheckStatus} style={styles.checkBtn}>VERIFY OWNERSHIP</button>
                </div>
            </div>

            {/* BÖLÜM 2: MARKET SEVKIYATI */}
            <div style={{...styles.card, borderTop: "4px solid #0277bd"}}>
                <h4>🚚 Step 2: Dispatch to Retailer</h4>
                <form onSubmit={handleTransferToRetailer}>
                    <input 
                        type="text" 
                        placeholder="Retailer Wallet Address (0x...)" 
                        value={retailerAddr} 
                        onChange={e => setRetailerAddr(e.target.value)} 
                        style={styles.input} 
                        required
                    />
                    <button type="submit" style={styles.transferBtn}>TRANSFER TO RETAILER</button>
                </form>
            </div>

            {status && (
                <div style={{
                    ...styles.statusBox, 
                    backgroundColor: status.includes("✅") ? "#e8f5e9" : "#fffde7"
                }}>
                    {status}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { maxWidth: "600px", margin: "30px auto", padding: "30px", borderRadius: "15px", backgroundColor: "#e1f5fe", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", fontFamily: "Arial, sans-serif" },
    infoBox: { fontSize: "0.8rem", padding: "10px", backgroundColor: "#fff", borderRadius: "8px", marginBottom: "20px", color: "#555", border: "1px solid #b3e5fc" },
    card: { backgroundColor: "#fff", padding: "20px", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
    inputGroup: { display: "flex", gap: "10px" },
    input: { flex: 1, padding: "12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.95rem", marginBottom: "10px" },
    checkBtn: { padding: "10px 15px", backgroundColor: "#546e7a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", height: "45px" },
    transferBtn: { width: "100%", padding: "15px", backgroundColor: "#0277bd", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" },
    statusBox: { padding: "15px", borderRadius: "8px", borderLeft: "6px solid #0277bd", marginTop: "10px", wordBreak: "break-all", fontSize: "0.9rem" }
};

export default Distributor;