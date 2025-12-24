import React, { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import { QRCodeSVG } from 'qrcode.react';

const Producer = () => {
    // Batch State
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [qty, setQty] = useState("");
    const [days, setDays] = useState("");
    
    // Admin State (For Authorization)
    const [transporterAddr, setTransporterAddr] = useState("");
    
    const [status, setStatus] = useState("");
    const [qrUrl, setQrUrl] = useState("");

    const getContract = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    };

    // --- 1. ADMIN FUNCTION: Register Transporter ---
    const handleRegister = async () => {
        if (!transporterAddr) return alert("Please enter a wallet address!");
        try {
            setStatus("⏳ Authorizing Transporter on Blockchain...");
            const contract = await getContract();
            const tx = await contract.registerTransporter(transporterAddr);
            await tx.wait();
            setStatus(`✅ Success: Address ${transporterAddr.slice(0,6)}... is now an Authorized Transporter!`);
            setTransporterAddr(""); // Clear input
        } catch (err) {
            console.error(err);
            setStatus(`❌ Admin Error: ${err.reason || "Only the Admin can register roles."}`);
        }
    };

    // --- 2. PRODUCER FUNCTION: Create Batch ---
    const handleCreateBatch = async (e) => {
        e.preventDefault();
        try {
            setStatus("⏳ Initializing Blockchain Transaction...");
            const contract = await getContract();
            
            const tx = await contract.createBatch(Number(id), name, Number(qty), Number(days));
            await tx.wait();
            
            localStorage.setItem("pendingBatchId", id);
            setStatus(`✅ Success! Batch #${id} Registered.`);
            setQrUrl(`${window.location.origin}/customer?batchId=${id}`);
        } catch (err) {
            console.error(err);
            setStatus(`❌ Error: ${err.reason || "Check contract permissions."}`);
        }
    };

    return (
        <div style={styles.container}>
            {/* --- ADMIN SECTION --- */}
            <div style={styles.adminCard}>
                <h3 style={{color: "#d32f2f", marginTop: 0}}>🛡️ Admin: Role Management</h3>
                <p style={{fontSize: "0.85rem", color: "#666"}}>Authorize a new Transporter before they can claim batches.</p>
                <div style={{display: "flex", gap: "10px"}}>
                    <input 
                        type="text" 
                        placeholder="Transporter Wallet Address (0x...)" 
                        value={transporterAddr} 
                        onChange={e => setTransporterAddr(e.target.value)} 
                        style={{...styles.input, flex: 1}} 
                    />
                    <button onClick={handleRegister} style={styles.adminBtn}>AUTHORIZE</button>
                </div>
            </div>

            <hr style={{margin: "25px 0", border: "0.5px solid #eee"}} />

            {/* --- PRODUCER SECTION --- */}
            <h2 style={{color: "#2e7d32"}}>👨‍🌾 Producer: Create New Batch</h2>
            <form onSubmit={handleCreateBatch} style={styles.form}>
                <input type="number" placeholder="Batch ID" value={id} onChange={e=>setId(e.target.value)} required style={styles.input} />
                <input type="text" placeholder="Product Name" value={name} onChange={e=>setName(e.target.value)} required style={styles.input} />
                <input type="number" placeholder="Quantity" value={qty} onChange={e=>setQty(e.target.value)} required style={styles.input} />
                <input type="number" placeholder="Shelf Life (Days)" value={days} onChange={e=>setDays(e.target.value)} required style={styles.input} />
                <button type="submit" style={styles.button}>REGISTER BATCH & GENERATE QR</button>
            </form>

            {qrUrl && (
                <div style={styles.qrCard}>
                    <p><strong>Traceability QR for Customers:</strong></p>
                    <QRCodeSVG value={qrUrl} size={128} />
                </div>
            )}
            
            {status && <div style={styles.statusBox}>{status}</div>}
        </div>
    );
};

const styles = {
    container: { maxWidth: "550px", margin: "20px auto", padding: "30px", borderRadius: "15px", backgroundColor: "#f1f8e9", border: "1px solid #c8e6c9", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" },
    adminCard: { padding: "15px", backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #ffcdd2" },
    adminBtn: { padding: "10px 15px", backgroundColor: "#d32f2f", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" },
    form: { display: "flex", flexDirection: "column", gap: "12px" },
    input: { padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem" },
    button: { padding: "15px", backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" },
    qrCard: { marginTop: "25px", textAlign: "center", padding: "15px", background: "#fff", borderRadius: "10px", border: "1px solid #eee" },
    statusBox: { marginTop: "20px", padding: "15px", background: "#fff", borderRadius: "8px", borderLeft: "6px solid #2e7d32", wordBreak: "break-all" }
};

export default Producer;