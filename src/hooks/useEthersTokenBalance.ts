import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { tokenAbi, tokenAddress } from '@/lib/tokenAbi';
import { useAccount } from 'wagmi';

export const useEthersTokenBalance = () => {
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, address } = useAccount();

  const fetchBalance = async (addr: string, provider: ethers.providers.Provider) => {
    try {
      const contract = new ethers.Contract(tokenAddress, tokenAbi, provider);
      let decimals = 18;

      try {
        const rawDecimals = await contract.decimals();
        decimals = Number(rawDecimals);
        console.log('Ethers: Token decimals:', decimals);
      } catch {
        console.warn('Fallback: Using default 18 decimals');
      }

      const rawBalance = await contract.balanceOf(addr);
      console.log('Ethers: Raw balance:', rawBalance.toString());

      const formatted = ethers.utils.formatUnits(rawBalance, decimals);
      console.log('Ethers: Formatted balance:', formatted);
      setBalance(formatted);
    } catch (err: any) {
      console.error('Ethers Token Balance Error:', err);
      setError(err?.message || 'Failed to get balance');
      setBalance('0');
    }
  };

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!isConnected || !address) throw new Error('No wallet connected');
        
        const provider =
          typeof window !== 'undefined' && window.ethereum
            ? new ethers.providers.Web3Provider(window.ethereum)
            : new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth_sepolia');

        console.log('Balance hook: using address', address);
        await fetchBalance(address, provider);
      } catch (err: any) {
        console.error('Balance fetch error:', err);
        setError(err?.message || 'Unexpected error');
        setBalance('0');
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [isConnected, address]);

  const refreshBalance = async () => {
    if (!isConnected || !address) return;
    setIsLoading(true);

    try {
      const provider =
        typeof window !== 'undefined' && window.ethereum
          ? new ethers.providers.Web3Provider(window.ethereum)
          : new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth_sepolia');

      await fetchBalance(address, provider);
      setError(null);
    } catch (err: any) {
      console.error('Refresh balance error:', err);
      setError(err?.message || 'Failed to refresh balance');
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

