import React, { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const Retailer = () => {
    const [batchId, setBatchId] = useState("");
    const [status, setStatus] = useState("");

    const handleInspection = async (passed) => {
        try {
            setStatus("⏳ Finalizing Batch...");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const tx = await contract.markAsArrived(batchId, passed);
            await tx.wait();
            setStatus(`✅ Batch ${passed ? "Accepted" : "Rejected"} & Finalized!`);
        } catch (err) {
            setStatus("❌ Error: Check if you currently own the batch.");
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={{color: "#880e4f"}}>🏪 Retailer Inspection</h2>
            <input type="number" placeholder="Batch ID" onChange={e=>setBatchId(e.target.value)} style={styles.input} />
            <div style={{display: "flex", gap: "10px", marginTop: "15px"}}>
                <button onClick={() => handleInspection(true)} style={{...styles.btn, backgroundColor: "#2e7d32"}}>APPROVE & RELEASE COLLATERAL</button>
                <button onClick={() => handleInspection(false)} style={{...styles.btn, backgroundColor: "#c62828"}}>REJECT SHIPMENT</button>
            </div>
            {status && <div style={styles.statusBox}>{status}</div>}
        </div>
    );
};

const styles = {
    container: { maxWidth: "500px", margin: "20px auto", padding: "20px", borderRadius: "10px", backgroundColor: "#fce4ec", border: "1px solid #f8bbd0" },
    input: { width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" },
    btn: { flex: 1, padding: "12px", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "0.8em", fontWeight: "bold" },
    statusBox: { marginTop: "15px", padding: "10px", backgroundColor: "#fff" }
};

export default Retailer;