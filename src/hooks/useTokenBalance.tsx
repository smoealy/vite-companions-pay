
import { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { formatUnits } from 'viem';

// IHRAM token details 
const IHRAM_TOKEN_ADDRESS = "0x2f4FB395cF2a622fAE074f7018563494072d1D95";

// Properly formatted ABI for viem/wagmi compatibility
const IHRAM_ABI = [
  {
    "inputs": [{ "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export function useTokenBalance() {
  const { address, isConnected } = useAccount();
  const [formattedBalance, setFormattedBalance] = useState<string>("0");
  const [decimals, setDecimals] = useState<number>(18);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get token decimals - updated for compatibility with wagmi v1.4.13 and @tanstack/react-query v4.x
  const { data: tokenDecimals } = useContractRead({
    address: IHRAM_TOKEN_ADDRESS as `0x${string}`,
    abi: IHRAM_ABI,
    functionName: "decimals",
    enabled: isConnected,
    // Removed incompatible TanStack Query options 
  });

  useEffect(() => {
    if (tokenDecimals) {
      console.log("Token decimals:", tokenDecimals);
      // Ensure decimals is always a number, not a BigInt
      setDecimals(Number(tokenDecimals));
    }
  }, [tokenDecimals]);

  // Get token balance - updated for compatibility with wagmi v1.4.13 and @tanstack/react-query v4.x
  const { data: rawBalance, isError, isLoading: isBalanceLoading } = useContractRead({
    address: IHRAM_TOKEN_ADDRESS as `0x${string}`,
    abi: IHRAM_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    enabled: isConnected && !!address,
    watch: true,
    // Removed incompatible TanStack Query options
  });

  useEffect(() => {
    setIsLoading(isBalanceLoading);
    if (rawBalance) {
      try {
        // Fix type issue: Ensure rawBalance is treated as bigint
        // The error occurs because rawBalance is of type unknown from useContractRead
        // We need to manually ensure it's treated as a bigint before passing to formatUnits
        const balance = formatUnits(BigInt(String(rawBalance)), decimals);
        console.log("WAGMI Raw balance:", String(rawBalance));
        console.log("WAGMI Formatted balance:", balance);
        setFormattedBalance(balance);
      } catch (error) {
        console.error("Error formatting balance:", error);
      }
    }
  }, [rawBalance, decimals, isBalanceLoading]);

  return {
    balance: formattedBalance,
    rawBalance,
    isLoading,
    isError,
    isConnected,
  };
}
