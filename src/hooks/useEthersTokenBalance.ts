import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { tokenAbi, tokenAddress } from '@/lib/tokenAbi';
import { useAccount } from 'wagmi';

// Declare global ethereum object for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useEthersTokenBalance = () => {
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, address } = useAccount();

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!window.ethereum) {
          console.log("No ethereum provider found");
          setError("No wallet detected");
          setIsLoading(false);
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // ✅ FIX FOR SAFARI/MOBILE – get connected address directly
        const accounts = await provider.listAccounts();
        const connectedAddress = address || accounts?.[0];
        if (!connectedAddress) {
          setError("No wallet connected");
          setIsLoading(false);
          return;
        }
        console.log("Ethers: Connected address:", connectedAddress);

        const contract = new ethers.Contract(tokenAddress, tokenAbi, provider);

        // Get decimals
        let decimals = 18;
        try {
          const rawDecimals = await contract.decimals();
          decimals = Number(rawDecimals);
          console.log("Ethers: Token decimals:", decimals);
        } catch (err) {
          console.error("Ethers: Failed to get decimals, using default 18");
        }

        // Get balance
        const rawBalance = await contract.balanceOf(connectedAddress);
        console.log("Ethers: Raw balance:", rawBalance.toString());

        const formatted = ethers.utils.formatUnits(rawBalance, decimals);
        console.log("Ethers: Formatted balance:", formatted);

        setBalance(formatted);
      } catch (err: any) {
        console.error("Ethers Token Balance Error:", err);
        setError(err?.message || "Failed to get balance");
        setBalance('0');
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      fetchBalance();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, address]); // ✅ FIX: re-run when wallet address changes

  const refreshBalance = async () => {
    if (isConnected) {
      try {
        setIsLoading(true);
        if (!window.ethereum) {
          throw new Error("No ethereum provider found");
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const accounts = await provider.listAccounts();
        const connectedAddress = address || accounts?.[0];
        if (!connectedAddress) {
          throw new Error("No wallet connected");
        }

        const contract = new ethers.Contract(tokenAddress, tokenAbi, provider);

        let decimals = 18;
        try {
          const rawDecimals = await contract.decimals();
          decimals = Number(rawDecimals);
        } catch (err) {
          console.warn("Failed to get decimals, using default 18");
        }

        const rawBalance = await contract.balanceOf(connectedAddress);
        const formatted = ethers.utils.formatUnits(rawBalance, decimals);
        setBalance(formatted);
        setError(null);
      } catch (err: any) {
        console.error("Error refreshing balance:", err);
        setError(err?.message || "Failed to refresh balance");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    balance,
    isLoading,
    error,
    refreshBalance,
  };
};
