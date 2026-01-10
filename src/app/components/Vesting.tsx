"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { abi as VestingABI } from "../abi/JobsTokenVestingERC20";
import { abi as TokenABI } from "../abi/JobsTokenFullV2";
import { CONTRACTS } from "../config/contracts";

interface VestingSchedule {
  total: bigint;
  claimed: bigint;
  start: bigint;
  cliff: bigint;
  duration: bigint;
  revoked: boolean;
}

export default function Vesting() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [selectedVestingId, setSelectedVestingId] = useState<string>("");

  // Read vesting count
  const { data: vestingCount, refetch: refetchVestingCount } = useReadContract({
    address: CONTRACTS.VESTING,
    abi: VestingABI,
    functionName: "vestingCount",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read token decimals
  const { data: decimals } = useReadContract({
    address: CONTRACTS.TOKEN,
    abi: TokenABI,
    functionName: "decimals",
  });

  // Read vesting schedules
  const [vestingSchedules, setVestingSchedules] = useState<Array<{ id: number; schedule: VestingSchedule; vested: bigint; releasable: bigint }>>([]);

  useEffect(() => {
    const fetchVestings = async () => {
      if (!address || !vestingCount || vestingCount === 0n || !decimals) return;

      const schedules: Array<{ id: number; schedule: VestingSchedule; vested: bigint; releasable: bigint }> = [];
      
      for (let i = 0; i < Number(vestingCount); i++) {
        // Note: This would require multiple contract calls. In a real app, you'd use multicall or a backend.
        // For now, we'll just show the count and let users claim individually.
        schedules.push({
          id: i,
          schedule: {
            total: 0n,
            claimed: 0n,
            start: 0n,
            cliff: 0n,
            duration: 0n,
            revoked: false,
          },
          vested: 0n,
          releasable: 0n,
        });
      }

      setVestingSchedules(schedules);
    };

    fetchVestings();
  }, [address, vestingCount, decimals]);

  const handleClaim = async (id: number) => {
    if (!address) return;
    try {
      await writeContract({
        address: CONTRACTS.VESTING,
        abi: VestingABI,
        functionName: "claim",
        args: [BigInt(id)],
      });
    } catch (err) {
      console.error("Claim error:", err);
    }
  };

  // Refetch after successful transaction
  useEffect(() => {
    if (isConfirmed) {
      refetchVestingCount();
      // Refresh vesting schedules
      setVestingSchedules([]);
      setTimeout(() => {
        if (vestingCount && vestingCount > 0n) {
          // Trigger re-fetch
          window.location.reload();
        }
      }, 2000);
    }
  }, [isConfirmed, refetchVestingCount, vestingCount]);

  if (!isConnected) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Please connect your wallet to view vesting information.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "2rem" }}>📅 Vesting</h2>

      {/* Vesting Count */}
      <div style={{ backgroundColor: "#1a1a1a", padding: "1.5rem", borderRadius: "10px", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Your Vesting Schedules</h3>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "1rem 0" }}>
          {vestingCount !== undefined
            ? `${vestingCount.toString()} schedule${Number(vestingCount) !== 1 ? "s" : ""}`
            : "Loading..."}
        </p>
      </div>

      {/* Vesting Schedules */}
      {vestingCount && vestingCount > 0n && (
        <div style={{ backgroundColor: "#1a1a1a", padding: "1.5rem", borderRadius: "10px", marginBottom: "2rem" }}>
          <h3 style={{ marginTop: 0 }}>Claim Vesting</h3>
          <p style={{ color: "#aaa", marginBottom: "1rem" }}>
            Select a vesting schedule ID to claim (0 to {Number(vestingCount) - 1})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            <input
              type="number"
              placeholder="Vesting ID (0, 1, 2...)"
              value={selectedVestingId}
              onChange={(e) => setSelectedVestingId(e.target.value)}
              min={0}
              max={vestingCount ? Number(vestingCount) - 1 : 0}
              style={{
                padding: "0.75rem",
                backgroundColor: "#2a2a2a",
                border: "1px solid #444",
                borderRadius: "5px",
                color: "#fff",
              }}
            />
            <button
              onClick={() => {
                if (selectedVestingId !== "") {
                  handleClaim(parseInt(selectedVestingId));
                }
              }}
              disabled={isPending || isConfirming || selectedVestingId === ""}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: isPending || isConfirming ? "#555" : "#44ff44",
                color: "#000",
                border: "none",
                borderRadius: "5px",
                cursor: isPending || isConfirming ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "bold",
              }}
            >
              {isPending ? "Confirming..." : isConfirming ? "Claiming..." : "Claim Vesting"}
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div style={{ backgroundColor: "#1a1a1a", padding: "1.5rem", borderRadius: "10px", marginTop: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>ℹ️ How Vesting Works</h3>
        <ul style={{ color: "#aaa", lineHeight: "1.8", paddingLeft: "1.5rem" }}>
          <li>Vesting schedules are created by the staking contract when rewards are earned.</li>
          <li>Each schedule has a start time, cliff period, and duration.</li>
          <li>You can claim vested tokens once the cliff period has passed.</li>
          <li>Tokens vest linearly over the duration period.</li>
          <li>Use the vesting ID (starting from 0) to claim a specific schedule.</li>
        </ul>
      </div>

      {error && (
        <div style={{ backgroundColor: "#2a1a1a", padding: "1rem", borderRadius: "5px", marginTop: "1rem" }}>
          <p style={{ color: "#ff4444", margin: 0 }}>
            Error: {error.message}
          </p>
        </div>
      )}

      {isConfirmed && (
        <div style={{ backgroundColor: "#1a2a1a", padding: "1rem", borderRadius: "5px", marginTop: "1rem" }}>
          <p style={{ color: "#44ff44", margin: 0 }}>
            ✅ Claim successful!
          </p>
        </div>
      )}
    </div>
  );
}

