"use client";

import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract } from "wagmi";
import { abi as ABI } from "./abi/JobsNFTFull";
import Token from "./components/Token";
import Staking from "./components/Staking";
import Vesting from "./components/Vesting";
import { CONTRACTS } from "./config/contracts";

type View = "nft" | "token" | "staking" | "vesting";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending, isSuccess } = useWriteContract();
  const [imageUrl, setImageUrl] = useState("");
  const [currentView, setCurrentView] = useState<View>("nft");

  const handleMint = async () => {
    if (!address) return;
    writeContract({
      abi: ABI,
      address: CONTRACTS.NFT,
      functionName: "mint",
      args: [address, "https://chocolate-official-crocodile-904.mypinata.cloud/ipfs/bafkreibvuthyde37cxj5clxzxfggr2iiffxb2da6p7tj65tkaxqgm35f2q"],
    });
    setImageUrl("https://chocolate-official-crocodile-904.mypinata.cloud/ipfs/bafybeiboxucsdfbeqmtfvzyii45i3rdmqi6eznmj4kzaraxi4adtexsalu");
  };

  return (
    <main
      style={{
        backgroundColor: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ margin: 0 }}>Jobs Protocol dApp</h1>
        <ConnectButton />
      </div>

      {/* Navigation */}
      <nav style={{ marginBottom: "2rem", borderBottom: "1px solid #444" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setCurrentView("nft")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: currentView === "nft" ? "#333" : "transparent",
              color: "#fff",
              border: "none",
              borderBottom: currentView === "nft" ? "2px solid #44ff44" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            🖼️ NFT Mint
          </button>
          <button
            onClick={() => setCurrentView("token")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: currentView === "token" ? "#333" : "transparent",
              color: "#fff",
              border: "none",
              borderBottom: currentView === "token" ? "2px solid #44ff44" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            🎫 Token
          </button>
          <button
            onClick={() => setCurrentView("staking")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: currentView === "staking" ? "#333" : "transparent",
              color: "#fff",
              border: "none",
              borderBottom: currentView === "staking" ? "2px solid #44ff44" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            💰 Staking
          </button>
          <button
            onClick={() => setCurrentView("vesting")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: currentView === "vesting" ? "#333" : "transparent",
              color: "#fff",
              border: "none",
              borderBottom: currentView === "vesting" ? "2px solid #44ff44" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            📅 Vesting
          </button>
        </div>
      </nav>

      {/* Content */}
      {currentView === "nft" && (
        <div>
          <h2 style={{ marginBottom: "1rem" }}>JobsNFT Mint</h2>
          {isConnected && (
            <button
              onClick={handleMint}
              disabled={isPending}
              style={{
                marginTop: "5px",
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#333",
                color: "#fff",
                border: "none",
                cursor: isPending ? "not-allowed" : "pointer",
                borderRadius: "5px",
              }}
            >
              {isPending ? "Minting..." : "Mint NFT"}
            </button>
          )}
          {imageUrl && (
            <div style={{ marginTop: "30px" }}>
              <p>✅ Tvoj NFT:</p>
              <img
                src={imageUrl}
                alt="Minted NFT"
                style={{ maxWidth: "90vw", borderRadius: "10px", marginTop: "10px" }}
              />
            </div>
          )}
        </div>
      )}

      {currentView === "token" && <Token />}
      {currentView === "staking" && <Staking />}
      {currentView === "vesting" && <Vesting />}

      {/* Footer */}
      <footer style={{ marginTop: "3rem", fontSize: "0.9rem", borderTop: "1px solid #444", paddingTop: "2rem" }}>
        <p>
          <a
            href="https://github.com/J0BSdev"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#aaa", textDecoration: "underline", marginRight: "1rem" }}
          >
            GitHub
          </a>
          <a
            href={`https://sepolia.etherscan.io/address/${CONTRACTS.TOKEN}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#aaa", textDecoration: "underline", marginRight: "1rem" }}
          >
            Token (Etherscan)
          </a>
          <a
            href={`https://sepolia.etherscan.io/address/${CONTRACTS.STAKING}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#aaa", textDecoration: "underline", marginRight: "1rem" }}
          >
            Staking (Etherscan)
          </a>
          <a
            href={`https://sepolia.etherscan.io/address/${CONTRACTS.NFT}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#aaa", textDecoration: "underline" }}
          >
            NFT (Etherscan)
          </a>
        </p>
      </footer>
    </main>
  );
}
