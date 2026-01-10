"use client";

import React, { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { abi } from "../abi/JobsTokenFullV2";
import { CONTRACTS } from "../config/contracts";

export default function Token() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [approveSpender, setApproveSpender] = useState("");
  const [approveAmount, setApproveAmount] = useState("");

  // Read balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.TOKEN,
    abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read token info
  const { data: name } = useReadContract({
    address: CONTRACTS.TOKEN,
    abi,
    functionName: "name",
  });

  const { data: symbol } = useReadContract({
    address: CONTRACTS.TOKEN,
    abi,
    functionName: "symbol",
  });

  const { data: decimals } = useReadContract({
    address: CONTRACTS.TOKEN,
    abi,
    functionName: "decimals",
  });

  const { data: totalSupply } = useReadContract({
    address: CONTRACTS.TOKEN,
    abi,
    functionName: "totalSupply",
  });

  const { data: cap } = useReadContract({
    address: CONTRACTS.TOKEN,
    abi,
    functionName: "cap",
  });

  const handleTransfer = async () => {
    if (!address || !transferTo || !transferAmount) return;
    try {
      const amount = parseUnits(transferAmount, decimals || 18);
      await writeContract({
        address: CONTRACTS.TOKEN,
        abi,
        functionName: "transfer",
        args: [transferTo as `0x${string}`, amount],
      });
      setTransferTo("");
      setTransferAmount("");
    } catch (err) {
      console.error("Transfer error:", err);
    }
  };

  const handleApprove = async () => {
    if (!address || !approveSpender || !approveAmount) return;
    try {
      const amount = parseUnits(approveAmount, decimals || 18);
      await writeContract({
        address: CONTRACTS.TOKEN,
        abi,
        functionName: "approve",
        args: [approveSpender as `0x${string}`, amount],
      });
      setApproveSpender("");
      setApproveAmount("");
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  // Refetch balance after successful transaction
  React.useEffect(() => {
    if (isConfirmed) {
      refetchBalance();
    }
  }, [isConfirmed, refetchBalance]);

  if (!isConnected) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Please connect your wallet to view token information.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "2rem" }}>🎫 {name || "Token"}</h2>

      {/* Token Info */}
      <div style={{ backgroundColor: "#1a1a1a", padding: "1.5rem", borderRadius: "10px", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Token Information</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
          <div>
            <p style={{ color: "#aaa", margin: "0.5rem 0" }}>Symbol</p>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{symbol || "N/A"}</p>
          </div>
          <div>
            <p style={{ color: "#aaa", margin: "0.5rem 0" }}>Decimals</p>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{decimals?.toString() || "N/A"}</p>
          </div>
          <div>
            <p style={{ color: "#aaa", margin: "0.5rem 0" }}>Total Supply</p>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              {totalSupply && decimals
                ? formatUnits(totalSupply, decimals)
                : "N/A"}
            </p>
          </div>
          <div>
            <p style={{ color: "#aaa", margin: "0.5rem 0" }}>Cap</p>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              {cap && decimals
                ? formatUnits(cap, decimals)
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div style={{ backgroundColor: "#1a1a1a", padding: "1.5rem", borderRadius: "10px", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Your Balance</h3>
        <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "1rem 0" }}>
          {balance && decimals
            ? `${formatUnits(balance, decimals)} ${symbol || ""}`
            : "Loading..."}
        </p>
      </div>

      {/* Transfer */}
      <div style={{ backgroundColor: "#1a1a1a", padding: "1.5rem", borderRadius: "10px", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Transfer Tokens</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <input
            type="text"
            placeholder="Recipient address (0x...)"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
            style={{
              padding: "0.75rem",
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "5px",
              color: "#fff",
            }}
          />
          <input
            type="number"
            placeholder="Amount"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            style={{
              padding: "0.75rem",
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "5px",
              color: "#fff",
            }}
          />
          <button
            onClick={handleTransfer}
            disabled={isPending || isConfirming || !transferTo || !transferAmount}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: isPending || isConfirming ? "#555" : "#333",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: isPending || isConfirming ? "not-allowed" : "pointer",
              fontSize: "1rem",
            }}
          >
            {isPending ? "Confirming..." : isConfirming ? "Transferring..." : "Transfer"}
          </button>
        </div>
        {error && (
          <p style={{ color: "#ff4444", marginTop: "1rem" }}>
            Error: {error.message}
          </p>
        )}
        {isConfirmed && (
          <p style={{ color: "#44ff44", marginTop: "1rem" }}>
            ✅ Transfer successful!
          </p>
        )}
      </div>

      {/* Approve */}
      <div style={{ backgroundColor: "#1a1a1a", padding: "1.5rem", borderRadius: "10px" }}>
        <h3 style={{ marginTop: 0 }}>Approve Tokens</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <input
            type="text"
            placeholder="Spender address (0x...)"
            value={approveSpender}
            onChange={(e) => setApproveSpender(e.target.value)}
            style={{
              padding: "0.75rem",
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "5px",
              color: "#fff",
            }}
          />
          <input
            type="number"
            placeholder="Amount"
            value={approveAmount}
            onChange={(e) => setApproveAmount(e.target.value)}
            style={{
              padding: "0.75rem",
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "5px",
              color: "#fff",
            }}
          />
          <button
            onClick={handleApprove}
            disabled={isPending || isConfirming || !approveSpender || !approveAmount}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: isPending || isConfirming ? "#555" : "#333",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: isPending || isConfirming ? "not-allowed" : "pointer",
              fontSize: "1rem",
            }}
          >
            {isPending ? "Confirming..." : isConfirming ? "Approving..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

