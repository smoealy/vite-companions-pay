import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { tokenAbi, tokenAddress } from '@/lib/tokenAbi';
import { useAccount } from 'wagmi';

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
        let provider;
        let connectedAddress = address;

        if (typeof window !== 'undefined' && window.ethereum) {
          provider = new ethers.providers.Web3Provider(window.ethereum);

          // ✅ Fix for Safari/Mobile WalletConnect
          const accounts = await provider.listAccounts();
          connectedAddress = address || accounts?.[0];

          if (!connectedAddress) {
            throw new Error('No wallet connected');
          }

          console.log('Ethers: Connected address:', connectedAddress);
        } else if (isConnected && address) {
          // ✅ Fallback for Safari (no window.ethereum)
          provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
          connectedAddress = address;
          console.warn('Fallback: Using RPC provider for:', connectedAddress);
        } else {
          throw new Error('No Ethereum provider or connected wallet');
        }

        const contract = new ethers.Contract(tokenAddress, tokenAbi, provider);

        // Get token decimals
        let decimals = 18;
        try {
          const rawDecimals = await contract.decimals();
          decimals = Number(rawDecimals);
          console.log('Ethers: Token decimals:', decimals);
        } catch (err) {
          console.error('Ethers: Failed to get decimals, using default 18');
        }

        // Get balance
        const rawBalance = await contract.balanceOf(connectedAddress);
        console.log('Ethers: Raw balance:', rawBalance.toString());

        const formatted = ethers.utils.formatUnits(rawBalance, decimals);
        console.log('Ethers: Formatted balance:', formatted);

        setBalance(formatted);
      } catch (err: any) {
        console.error('Ethers Token Balance Error:', err);
        setError(err?.message || 'Failed to get balance');
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
  }, [isConnected, address]);

  const refreshBalance = async () => {
    if (isConnected) {
      try {
        setIsLoading(true);
        let provider;
        let connectedAddress = address;

        if (typeof window !== 'undefined' && window.ethereum) {
          provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          connectedAddress = address || accounts?.[0];

          if (!connectedAddress) {
            throw new Error('No wallet connected');
          }
        } else {
          provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
        }

        const contract = new ethers.Contract(tokenAddress, tokenAbi, provider);

        let decimals = 18;
        try {
          const rawDecimals = await contract.decimals();
          decimals = Number(rawDecimals);
        } catch {
          console.warn('Fallback: Using default 18 decimals');
        }

        const rawBalance = await contract.balanceOf(connectedAddress);
        const formatted = ethers.utils.formatUnits(rawBalance, decimals);
        setBalance(formatted);
        setError(null);
      } catch (err: any) {
        console.error('Error refreshing balance:', err);
        setError(err?.message || 'Failed to refresh balance');
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
