import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { tokenAbi, tokenAddress } from '@/lib/tokenAbi';
import { useAccount, usePublicClient } from 'wagmi';

export const useEthersTokenBalance = () => {
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient(); // wagmi fallback if no window.ethereum

  const fetchBalance = async (addr: string, provider: ethers.providers.Provider) => {
    try {
      const contract = new ethers.Contract(tokenAddress, tokenAbi, provider);
      let decimals = 18;
      try {
        decimals = await contract.decimals();
      } catch {
        console.warn('Fallback: Using default 18 decimals');
      }

      const rawBalance = await contract.balanceOf(addr);
      const formatted = ethers.utils.formatUnits(rawBalance, decimals);
      setBalance(formatted);
    } catch (err: any) {
      console.error('Balance fetch error:', err);
      setError(err.message || 'Failed to fetch token balance');
      setBalance('0');
    }
  };

  useEffect(() => {
    const loadBalance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let provider: ethers.providers.Provider;
        let connectedAddress = address;

        if (typeof window !== 'undefined' && window.ethereum) {
          provider = new ethers.providers.Web3Provider(window.ethereum, 'any'); // ✅ Fix for chain switching & mobile
          const accounts = await provider.listAccounts();
          connectedAddress = address || accounts?.[0] || window.ethereum?.selectedAddress;
          if (!connectedAddress) throw new Error('No wallet connected');
        } else if (publicClient && address) {
          provider = new ethers.providers.JsonRpcProvider(publicClient.transport.url);
        } else {
          throw new Error('No provider available');
        }

        await fetchBalance(connectedAddress!, provider);
      } catch (err: any) {
        setError(err.message);
        setBalance('0');
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      loadBalance();
    } else {
      setBalance('0');
      setIsLoading(false);
    }
  }, [isConnected, address]);

  const refreshBalance = async () => {
    if (!isConnected || !address) return;
    setIsLoading(true);

    try {
      let provider: ethers.providers.Provider;
      if (typeof window !== 'undefined' && window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      } else if (publicClient) {
        provider = new ethers.providers.JsonRpcProvider(publicClient.transport.url);
      } else {
        throw new Error('No provider found');
      }

      await fetchBalance(address, provider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    balance,
    isLoading,
    error,
    refreshBalance,
  };
};
