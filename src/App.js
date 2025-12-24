import React, { useState } from "react";

// Importing the updated components
import Admin from "./components/Admin";
import Producer from "./components/Producer";
import Transporter from "./components/Transporter";
import Distributor from "./components/Distributor";
import Retailer from "./components/Retailer";
import Customer from "./components/Customer";

function App() {
  const [activeRole, setActiveRole] = useState(null);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🥦 FRESHCHAIN TRACKING SYSTEM</h1>
        <p style={styles.subtitle}>Blockchain-Based Supply Chain</p>
      </header>

      {/* --- MAIN MENU (Role Selection) --- */}
      {!activeRole && (
        <div style={styles.menuContainer}>
          <h3 style={{ marginBottom: "50px", color: "#424242", fontWeight: "600" }}>
            Please Select Your Role to Access the Portal:
          </h3>
          
          <div style={styles.grid}>
            {/* Admin Button */}
            <button 
              onClick={() => setActiveRole("admin")} 
              style={{ ...styles.menuButton, backgroundColor: "#fff3f3", color: "#c62828", border: "3px solid #ffcdd2" }}
            >
              🛠️ Admin
            </button>

            {/* Producer Button */}
            <button 
              onClick={() => setActiveRole("producer")} 
              style={{ ...styles.menuButton, backgroundColor: "#f1f8e9", color: "#388e3c", border: "3px solid #c8e6c9" }}
            >
              👨‍🌾 Producer
            </button>

            {/* Transporter Button */}
            <button 
              onClick={() => setActiveRole("transporter")} 
              style={{ ...styles.menuButton, backgroundColor: "#fff8e1", color: "#f57c00", border: "3px solid #ffe0b2" }}
            >
              🚚 Transporter
            </button>

            {/* Distributor Button */}
            <button 
              onClick={() => setActiveRole("distributor")} 
              style={{ ...styles.menuButton, backgroundColor: "#f3e5f5", color: "#8e24aa", border: "3px solid #e1bee7" }}
            >
              🏭 Distributor
            </button>

            {/* Retailer Button */}
            <button 
              onClick={() => setActiveRole("retailer")} 
              style={{ ...styles.menuButton, backgroundColor: "#fce4ec", color: "#d81b60", border: "3px solid #f8bbd0" }}
            >
              🏪 Retailer
            </button>

            {/* Customer Button */}
            <button 
              onClick={() => setActiveRole("customer")} 
              style={{ ...styles.menuButton, backgroundColor: "#e3f2fd", color: "#1976d2", border: "3px solid #bbdefb" }}
            >
              🛒 Customer Trace 
            </button>
          </div>
        </div>
      )}

      {/* --- SELECTED PAGE RENDERING --- */}
      {activeRole && (
        <div style={styles.contentContainer}>
          {/* Back Button and Navigation Bar */}
          <div style={styles.navBar}>
            <button onClick={() => setActiveRole(null)} style={styles.backButton}>
              ⬅ Back to Main Menu
            </button>
            <span style={styles.roleTag}>Portal: {activeRole.toUpperCase()}</span>
          </div>

          {/* Rendering the Corresponding Component */}
          <div style={styles.componentWrapper}>
            {activeRole === "admin" && <Admin />}
            {activeRole === "producer" && <Producer />}
            {activeRole === "transporter" && <Transporter />}
            {activeRole === "distributor" && <Distributor />}
            {activeRole === "retailer" && <Retailer />}
            {activeRole === "customer" && <Customer />}
          </div>
        </div>
      )}
    </div>
  );
}

// Keeping your original styling object intact
const styles = {
    container: {
        fontFamily: "'Inter', sans-serif", 
        maxWidth: "960px", 
        margin: "20px auto",
        padding: "30px",
        textAlign: "center",
        backgroundColor: "#f7f7f7", 
        minHeight: "calc(100vh - 40px)",
        borderRadius: "15px", 
    },
    header: {
        marginBottom: "50px",
        borderBottom: "7px solid #e0e0e0", 
        paddingBottom: "35px"
    },
    title: {
        color: "#1a1a1a",
        margin: "0",
        fontSize: "2.5em"
    },
    subtitle: {
        color: "#666",
        marginTop: "10px",
        fontSize: "1.3em"
    },
    menuContainer: {
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "15px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)" 
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "25px",
        marginTop: "30px"
    },
    menuButton: {
        padding: "25px 20px",
        fontSize: "24px",
        fontWeight: "600",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        outline: "none",
        boxShadow: "0 4px 6px rgba(0,0,0,0.08)", 
        border: "none", 
    },
    navBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        padding: "10px 0"
    },
    backButton: {
        padding: "10px 25px",
        backgroundColor: "#455a64", 
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        transition: "background-color 0.3s"
    },
    roleTag: {
        fontSize: "16px",
        color: "#757575",
        fontWeight: "bold",
        letterSpacing: "1px",
        padding: "8px 15px",
        backgroundColor: "#e0e0e0",
        borderRadius: "20px"
    },
    componentWrapper: {
        marginTop: "10px"
    }
};

export default App;