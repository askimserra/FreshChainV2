import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const Transporter = () => {
    const [batchId, setBatchId] = useState("");
    const [distributorAddr, setDistributorAddr] = useState(""); // Yeni: Dağıtıcı adresi
    const [temp, setTemp] = useState("");
    const [hum, setHum] = useState("");
    const [loc, setLoc] = useState("");
    const [status, setStatus] = useState("");
    const [activeWallet, setActiveWallet] = useState("");

    useEffect(() => {
        checkWallet();
    }, []);

    const checkWallet = async () => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            setActiveWallet(await signer.getAddress());
        }
    };

    const getContract = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    };

    // --- 1. DEVRALMA (CLAIM) ---
    const handleTakeOwnership = async () => {
        try {
            setStatus("⏳ Claiming Ownership...");
            const contract = await getContract();
            const tx = await contract.transferOwnership(Number(batchId), activeWallet, {
                value: ethers.parseEther("0.0001")
            });
            await tx.wait();
            setStatus("✅ Ownership Secured! Now you can log data or transfer to Distributor.");
        } catch (err) {
            setStatus(`❌ Claim Failed: ${err.reason || "Check authorization."}`);
        }
    };

    // --- 2. VERİ GİRİŞİ ---
    const handleAddSensorData = async (e) => {
        e.preventDefault();
        try {
            setStatus("⏳ Syncing Telemetry...");
            const contract = await getContract();
            const tx = await contract.addSensorData(Number(batchId), Number(temp), Number(hum), loc);
            await tx.wait();
            setStatus(`✅ Data Logged successfully!`);
        } catch (err) {
            setStatus(`❌ Update Failed: ${err.reason}`);
        }
    };

    // --- 3. DAĞITICIYA TRANSFER (YENİ!) ---
    const handleHandover = async () => {
        if (!distributorAddr) return alert("Please enter Distributor Address!");
        try {
            setStatus("⏳ Transferring to Distributor...");
            const contract = await getContract();
            
            // Annen (currentOwner) olduğu için bu fonksiyonu çağırıp yeni sahibini (seni) belirler
            const tx = await contract.transferOwnership(Number(batchId), distributorAddr);
            await tx.wait();
            
            setStatus(`✅ Success! Batch handed over to: ${distributorAddr.slice(0,6)}...`);
        } catch (err) {
            setStatus(`❌ Transfer Failed: ${err.reason}`);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={{color: "#e65100"}}>🚚 Transporter Dashboard</h2>
            
            {/* CLAIM BÖLÜMÜ */}
            <div style={styles.card}>
                <h4>1. Claim Batch</h4>
                <input type="number" placeholder="Batch ID" value={batchId} onChange={e=>setBatchId(e.target.value)} style={styles.input} />
                <button onClick={handleTakeOwnership} style={styles.claimBtn}>DEPOSIT & CLAIM</button>
            </div>

            {/* VERİ GİRİŞİ BÖLÜMÜ */}
            <div style={styles.card}>
                <h4>2. Log Sensor Data</h4>
                <form onSubmit={handleAddSensorData} style={styles.form}>
                    <input type="number" placeholder="Temp" onChange={e=>setTemp(e.target.value)} style={styles.input} />
                    <input type="number" placeholder="Hum" onChange={e=>setHum(e.target.value)} style={styles.input} />
                    <input type="text" placeholder="Location" onChange={e=>setLoc(e.target.value)} style={styles.input} />
                    <button type="submit" style={styles.logBtn}>SEND DATA</button>
                </form>
            </div>

            {/* TRANSFER BÖLÜMÜ (YENİ) */}
            <div style={{...styles.card, border: "2px solid #2e7d32"}}>
                <h4>3. Handover to Distributor</h4>
                <p style={{fontSize: "0.8rem"}}>Enter Distributor's Wallet Address to transfer ownership.</p>
                <input 
                    type="text" 
                    placeholder="Distributor Address (0x...)" 
                    value={distributorAddr} 
                    onChange={e=>setDistributorAddr(e.target.value)} 
                    style={styles.input} 
                />
                <button onClick={handleHandover} style={styles.transferBtn}>TRANSFER OWNERSHIP</button>
            </div>
            
            {status && <div style={styles.statusBox}>{status}</div>}
        </div>
    );
};

const styles = {
    container: { maxWidth: "500px", margin: "20px auto", padding: "20px", backgroundColor: "#fff3e0", borderRadius: "10px" },
    card: { backgroundColor: "white", padding: "15px", borderRadius: "8px", marginBottom: "15px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
    input: { width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" },
    form: { display: "flex", flexDirection: "column" },
    claimBtn: { width: "100%", padding: "10px", backgroundColor: "#333", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
    logBtn: { width: "100%", padding: "10px", backgroundColor: "#e65100", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
    transferBtn: { width: "100%", padding: "10px", backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" },
    statusBox: { marginTop: "15px", padding: "10px", backgroundColor: "white", borderLeft: "5px solid #e65100", wordBreak: "break-all" }
};

export default Transporter;