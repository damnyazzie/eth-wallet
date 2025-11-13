import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function Home() {
  const [wallet, setWallet] = useState(null);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [network, setNetwork] = useState("homestead"); // Ethereum mainnet
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    if (localStorage.getItem("encryptedWallet")) {
      decryptWallet();
    }
  }, []);

  async function createWallet() {
    const newWallet = ethers.Wallet.createRandom();
    const password = prompt("Set a password to encrypt your wallet:");
    const encrypted = await newWallet.encrypt(password);
    localStorage.setItem("encryptedWallet", encrypted);
    setWallet(newWallet);
    setAddress(newWallet.address);
    alert("Wallet created and encrypted!");
  }

  async function decryptWallet() {
    const encrypted = localStorage.getItem("encryptedWallet");
    const password = prompt("Enter your wallet password:");
    try {
      const decrypted = await ethers.Wallet.fromEncryptedJson(encrypted, password);
      setWallet(decrypted);
      setAddress(decrypted.address);
      fetchBalance(decrypted);
    } catch (err) {
      alert("Incorrect password or corrupted wallet file.");
    }
  }

  async function fetchBalance(w) {
    const provider = new ethers.providers.InfuraProvider(network, "https://mainnet.infura.io/v3/1252763ea6bb46dc813c699669005437");
    const bal = await provider.getBalance(w.address);
    setBalance(ethers.utils.formatEther(bal));
  }

  async function sendTransaction() {
    if (!wallet) return alert("Unlock your wallet first!");
    const provider = new ethers.providers.InfuraProvider(network, "https://mainnet.infura.io/v3/1252763ea6bb46dc813c699669005437");
    const signer = wallet.connect(provider);

    try {
      const tx = await signer.sendTransaction({
        to,
        value: ethers.utils.parseEther(amount),
      });
      alert(`Transaction sent! Hash: ${tx.hash}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>🦊 Decentralized Web Wallet</h1>
      {!wallet ? (
        <button onClick={createWallet}>Create Wallet</button>
      ) : (
        <>
          <p><b>Address:</b> {address}</p>
          <p><b>Balance:</b> {balance} ETH</p>
          <button onClick={() => fetchBalance(wallet)}>Refresh Balance</button>

          <h3>Send ETH</h3>
          <input
            placeholder="Recipient Address"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <input
            placeholder="Amount (ETH)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={sendTransaction}>Send</button>
        </>
      )}
    </div>
  );
}
