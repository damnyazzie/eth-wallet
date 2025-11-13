"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function Home() {
  const [wallet, setWallet] = useState<ethers.HDNodeWallet | null>(null);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");
  const [network, setNetwork] = useState("mainnet");

  useEffect(() => {
    if (localStorage.getItem("encryptedWallet")) {
      decryptWallet();
    }
  }, []);

  async function createWallet() {
    const newWallet = ethers.Wallet.createRandom();
    const password = prompt("Set a password to encrypt your wallet:");
    if (!password) return;

    const encrypted = await newWallet.encrypt(password);
    localStorage.setItem("encryptedWallet", encrypted);
    setWallet(newWallet);
    setAddress(newWallet.address);
    alert("✅ Wallet created and encrypted locally!");
  }

  async function decryptWallet() {
    const encrypted = localStorage.getItem("encryptedWallet");
    if (!encrypted) return alert("No wallet found. Create one first.");
    const password = prompt("Enter your wallet password:");
    if (!password) return;

    try {
      const decrypted = await ethers.Wallet.fromEncryptedJson(encrypted, password);
      setWallet(decrypted);
      setAddress(decrypted.address);
      fetchBalance(decrypted);
    } catch {
      alert("❌ Incorrect password or corrupted wallet file.");
    }
  }

  async function fetchBalance(w: ethers.Wallet) {
    try {
      const provider = new ethers.JsonRpcProvider(
        "https://mainnet.infura.io/v3/1252763ea6bb46dc813c699669005437"
      );
      const bal = await provider.getBalance(w.address);
      setBalance(ethers.formatEther(bal));
    } catch (err) {
      console.error(err);
      alert("Error fetching balance. Check network or Infura key.");
    }
  }

  async function sendTransaction() {
    if (!wallet) return alert("Unlock your wallet first!");
    if (!to || !amount) return alert("Enter recipient and amount.");

    try {
      const provider = new ethers.JsonRpcProvider(
        "https://mainnet.infura.io/v3/1252763ea6bb46dc813c699669005437"
      );
      const signer = wallet.connect(provider);

      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });

      alert(`✅ Transaction sent!\nHash: ${tx.hash}`);
    } catch (err: any) {
      console.error(err);
      alert(`❌ Error: ${err.message}`);
    }
  }

  function resetWallet() {
    localStorage.removeItem("encryptedWallet");
    setWallet(null);
    setAddress("");
    setBalance("");
    alert("Wallet removed from local storage.");
  }

  return (
    <div
      style={{
        padding: 40,
        fontFamily: "system-ui, sans-serif",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      <h1>🦊 Decentralized Web Wallet</h1>

      {!wallet ? (
        <div style={{ marginTop: 20 }}>
          <button onClick={createWallet}>Create New Wallet</button>
          <span style={{ margin: "0 10px" }}>or</span>
          <button onClick={decryptWallet}>Unlock Existing Wallet</button>
        </div>
      ) : (
        <>
          <div style={{ marginTop: 20, wordBreak: "break-all" }}>
            <p><b>Address:</b> {address}</p>
            <p><b>Balance:</b> {balance ? `${balance} ETH` : "Loading..."}</p>
          </div>

          <button onClick={() => fetchBalance(wallet)}>🔄 Refresh Balance</button>
          <button style={{ marginLeft: 10 }} onClick={resetWallet}>
            🧹 Reset Wallet
          </button>

          <div style={{ marginTop: 30 }}>
            <h3>💸 Send ETH</h3>
            <input
              placeholder="Recipient Address"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{
                width: "100%",
                marginBottom: 10,
                padding: 8,
                fontSize: 16,
              }}
            />
            <input
              placeholder="Amount (ETH)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                width: "100%",
                marginBottom: 10,
                padding: 8,
                fontSize: 16,
              }}
            />
            <button onClick={sendTransaction}>🚀 Send</button>
          </div>
        </>
      )}
    </div>
  );
}
