"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { abi as TokenABI } from "../abi/JobsTokenFullV2";
import { abi as StakingABI } from "../abi/JobsTokenStaking";
import { CONTRACTS } from "../config/contracts";

export default function Staking() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  // Read token balance
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: CONTRACTS.TOKEN,
    abi: TokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read staked balance
  const { data: stakedBalance, refetch: refetchStakedBalance } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: StakingABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read reward balance
  const { data: rewardBalance, refetch: refetchRewardBalance } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: StakingABI,
    functionName: "pendingRewards",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read staking stats
  const { data: totalStaked } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: StakingABI,
    functionName: "totalStaked",
  });

  const { data: rewardRate } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: StakingABI,
    functionName: "rewardRatePerSecond",
  });

  const { data: periodFinish } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: StakingABI,
    functionName: "periodFinish",
  });

  const { data: rewardsDuration } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: StakingABI,
    functionName: "rewardsDuration",
  });

  // Read token decimals
  const { data: decimals } = useReadContract({
    address: CONTRACTS.TOKEN,
    abi: TokenABI,
    functionName: "decimals",
  });

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.TOKEN,
    abi: TokenABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.STAKING] : undefined,
    query: { enabled: !!address },
  });

  const handleStake = async () => {
    if (!address || !stakeAmount || !decimals) return;
    try {
      const amount = parseUnits(stakeAmount, decimals);
      
      // Check if approval is needed
      if (!allowance || allowance < amount) {
        // Approve first
        await writeContract({
          address: CONTRACTS.TOKEN,
          abi: TokenABI,
          functionName: "approve",
          args: [CONTRACTS.STAKING, amount],
        });
        // Wait a bit, then stake
        setTimeout(async () => {
          await writeContract({
            address: CONTRACTS.STAKING,
            abi: StakingABI,
            functionName: "stake",
            args: [amount],
          });
        }, 2000);
      } else {
        // Stake directly
        await writeContract({
          address: CONTRACTS.STAKING,
          abi: StakingABI,
          functionName: "stake",
          args: [amount],
        });
      }
      setStakeAmount("");
    } catch (err) {
      console.error("Stake error:", err);
    }
  };

  const handleUnstake = async () => {
    if (!address || !unstakeAmount || !decimals) return;
    try {
      const amount = parseUnits(unstakeAmount, decimals);
      await writeContract({
        address: CONTRACTS.STAKING,
        abi: StakingABI,
        functionName: "unstake",
        args: [amount],
      });
      setUnstakeAmount("");
    } catch (err) {
      console.error("Unstake error:", err);
    }
  };

  const handleClaimRewards = async () => {
    if (!address) return;
    try {
      await writeContract({
        address: CONTRACTS.STAKING,
        abi: StakingABI,
        functionName: "claim",
      });
    } catch (err) {
      console.error("Claim error:", err);
    }
  };

  // Refetch data after successful transaction
  useEffect(() => {
    if (isConfirmed) {
      refetchTokenBalance();
      refetchStakedBalance();
      refetchRewardBalance();
      refetchAllowance();
    }
  }, [isConfirmed, refetchTokenBalance, refetchStakedBalance, refetchRewardBalance, refetchAllowance]);

  if (!isConnected) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Please connect your wallet to view staking information.</p>
      </div>
    );
  }

  const tokenDecimals = decimals || 18;
  const now = Math.floor(Date.now() / 1000);
  const timeRemaining =
    periodFinish && typeof periodFinish === "bigint" && periodFinish > BigInt(now)
      ? Number(periodFinish - BigInt(now))
      : 0;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "2rem" }}>💰 Staking</h2>

      {/* Stats */}
      <div style={{ backgroundColor: "#1a1a1a", padding: "1.5rem", borderRadius: "10px", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Staking Stats</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
          <div>
            <p style={{ color: "#aaa", margin: "0.5rem 0" }}>Total Staked</p>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              {totalStaked && decimals
                ? formatUnits(totalStaked, decimals)
                : "N/A"}
            </p>
          </div>
          <div>
            <p style={{ color: "#aaa", margin: "0.5rem 0" }}>Reward Rate (per second)</p>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              {rewardRate && decimals
                ? formatUnits(rewardRate, decimals)
                : "N/A"}
            </p>
          </div>
          <div>
            <p style={{ color: "#aaa", margin: "0.5rem 0" }}>Period Finish</p>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              {periodFinish && typeof periodFinish === "bigint"
                ? new Date(Number(periodFinish) * 1000).toLocaleString()
                : "N/A"}
            </p>
          </div>
          <div>
            <p style={{ color: "#aaa", margin: "0.5rem 0" }}>Time Remaining</p>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              {timeRemaining > 0
                ? `${Math.floor(timeRemaining / 86400)} days ${Math.floor((timeRemaining % 86400) / 3600)} hours`
                : "Ended"}
            </p>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div style={{ backgroundColor: "#1a1a1a", padding: "1.5rem", borderRadius: "10px", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Your Staking</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
          <div>
            <p style={{ color: "#aaa", margin: "0.5rem 0" }}>Wallet Balance</p>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              {tokenBalance && decimals
                ? formatUnits(tokenBalance, decimals)
                : "Loading..."}
            </p>
          </div>
          <div>
            <p style={{ color: "#aaa", margin: "0.5rem 0" }}>Staked Balance</p>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              {stakedBalance && decimals
                ? formatUnits(stakedBalance, decimals)
                : "0"}
            </p>
          </div>
          <div>
            <p style={{ color: "#aaa", margin: "0.5rem 0" }}>Rewards</p>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#44ff44" }}>
              {rewardBalance && decimals
                ? formatUnits(rewardBalance, decimals)
                : "0"}
            </p>
          </div>
        </div>
      </div>

      {/* Stake */}
      <div style={{ backgroundColor: "#1a1a1a", padding: "1.5rem", borderRadius: "10px", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Stake Tokens</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <input
            type="number"
            placeholder="Amount to stake"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            style={{
              padding: "0.75rem",
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "5px",
              color: "#fff",
            }}
          />
          <button
            onClick={handleStake}
            disabled={isPending || isConfirming || !stakeAmount}
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
            {isPending ? "Confirming..." : isConfirming ? "Staking..." : "Stake"}
          </button>
        </div>
      </div>

      {/* Unstake */}
      <div style={{ backgroundColor: "#1a1a1a", padding: "1.5rem", borderRadius: "10px", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Unstake Tokens</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <input
            type="number"
            placeholder="Amount to unstake"
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(e.target.value)}
            style={{
              padding: "0.75rem",
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "5px",
              color: "#fff",
            }}
          />
          <button
            onClick={handleUnstake}
            disabled={isPending || isConfirming || !unstakeAmount}
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
            {isPending ? "Confirming..." : isConfirming ? "Unstaking..." : "Unstake"}
          </button>
          <button
            onClick={async () => {
              if (!address || !decimals) return;
              try {
                // Unstake all
                if (stakedBalance && stakedBalance > 0n) {
                  await writeContract({
                    address: CONTRACTS.STAKING,
                    abi: StakingABI,
                    functionName: "unstake",
                    args: [stakedBalance],
                  });
                }
              } catch (err) {
                console.error("Unstake all error:", err);
              }
            }}
            disabled={isPending || isConfirming || !stakedBalance || stakedBalance === 0n}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: isPending || isConfirming || !stakedBalance || stakedBalance === 0n ? "#555" : "#333",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: isPending || isConfirming || !stakedBalance || stakedBalance === 0n ? "not-allowed" : "pointer",
              fontSize: "1rem",
              marginTop: "0.5rem",
            }}
          >
            Unstake All
          </button>
        </div>
      </div>

      {/* Claim Rewards */}
      <div style={{ backgroundColor: "#1a1a1a", padding: "1.5rem", borderRadius: "10px", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Claim Rewards</h3>
        <button
          onClick={handleClaimRewards}
          disabled={isPending || isConfirming || !rewardBalance || rewardBalance === 0n}
          style={{
            padding: "0.75rem 1.5rem",
            width: "100%",
            backgroundColor: isPending || isConfirming || !rewardBalance || rewardBalance === 0n ? "#555" : "#44ff44",
            color: "#000",
            border: "none",
            borderRadius: "5px",
            cursor: isPending || isConfirming || !rewardBalance || rewardBalance === 0n ? "not-allowed" : "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
            marginTop: "1rem",
          }}
        >
          {isPending ? "Confirming..." : isConfirming ? "Claiming..." : "Claim Rewards"}
        </button>
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
            ✅ Transaction successful!
          </p>
        </div>
      )}
    </div>
  );
}

