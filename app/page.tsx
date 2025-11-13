"use client";

import { useState<Wallet | HDNodeWallet | null>(null) } from "react";
import { ethers } from "ethers";

export default function Home() {
  // State variables
  const [wallet, setWallet] = useState<Wallet | HDNodeWallet | null>(null)<ethers.Wallet | ethers.HDNodeWallet | null>(null);

  const [address, setAddress] = useState<Wallet | HDNodeWallet | null>(null)<string>("");
  const [balance, setBalance] = useState<Wallet | HDNodeWallet | null>(null)<string>("");
  const [password, setPassword] = useState<Wallet | HDNodeWallet | null>(null)<string>("");

  /**
   * Create a new Ethereum wallet and encrypt it with a password
   */
  async function createWallet() {
    try {
      const newWallet = ethers.Wallet.createRandom();
      const encrypted = await newWallet.encrypt(password);
      if (typeof window !== "undefined") {
        localStorage.setItem("encryptedWallet", encrypted);
      }
      setWallet(newWallet);
      setAddress(newWallet.address);
      alert("✅ Wallet created and encrypted locally!");
    } catch (err) {
      console.error("Wallet creation error:", err);
      alert("❌ Failed to create wallet");
    }
  }

  /**
   * Decrypt an existing wallet from localStorage
   */
  async function decryptWallet() {
    try {
      if (typeof window === "undefined") return;
      const encrypted = localStorage.getItem("encryptedWallet");
      if (!encrypted) {
        alert("⚠️ No encrypted wallet found.");
        return;
      }

      const decrypted = await ethers.Wallet.fromEncryptedJson(encrypted, password);
      setWallet(decrypted);
      setAddress(decrypted.address);
      fetchBalance(decrypted);
      alert("🔓 Wallet decrypted successfully!");
    } catch (err) {
      console.error("Decryption error:", err);
      alert("❌ Incorrect password or corrupted wallet file.");
    }
  }

  /**
   * Fetch ETH balance for a given wallet
   */
  async function fetchBalance(w: ethers.Wallet | ethers.HDNodeWallet) {
    try {
      const provider = new ethers.InfuraProvider(
        "mainnet",
        process.env.NEXT_PUBLIC_INFURA_KEY || "YOUR_INFURA_PROJECT_ID"
      );
      const bal = await provider.getBalance(w.address);
      setBalance(ethers.formatEther(bal));
    } catch (err) {
      console.error("Balance fetch error:", err);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">🔐 Ethereum Wallet</h1>

      <input
        type="password"
        placeholder="Enter wallet password"
        className="p-2 mb-4 w-64 text-black rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex gap-4">
        <button
          onClick={createWallet}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Create Wallet
        </button>
        <button
          onClick={decryptWallet}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Load Wallet
        </button>
      </div>

      {address && (
        <div className="mt-8 text-center">
          <p className="text-lg">
            <strong>Address:</strong> {address}
          </p>
          {balance && (
            <p className="mt-2 text-lg">
              <strong>Balance:</strong> {balance} ETH
            </p>
          )}
        </div>
      )}
    </main>
  );
}
