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

      let connectedAddress = address;
      let provider: ethers.providers.Provider | null = null;

      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          connectedAddress = address || accounts?.[0] || window.ethereum?.selectedAddress;

          if (!connectedAddress) throw new Error('No wallet connected');
          console.log('Web3Provider connected address:', connectedAddress);
        } else if (isConnected && address) {
          provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth_sepolia');
          console.warn('Using fallback RPC provider for:', address);
        } else {
          throw new Error('No Ethereum provider available');
        }

        await fetchBalance(connectedAddress!, provider!);
      } catch (err: any) {
        console.error('Balance fetch error:', err);
        setError(err?.message || 'Unexpected error');
        setBalance('0');
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      run();
    } else {
      setBalance('0');
      setIsLoading(false);
    }
  }, [isConnected, address]);

  const refreshBalance = async () => {
    if (!isConnected) return;
    setIsLoading(true);

    try {
      let provider: ethers.providers.Provider;
      let connectedAddress = address;

      if (typeof window !== 'undefined' && window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        connectedAddress = address || accounts?.[0] || window.ethereum?.selectedAddress;
        if (!connectedAddress) throw new Error('No wallet connected');
      } else {
        provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth_sepolia');
      }

      await fetchBalance(connectedAddress!, provider);
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
