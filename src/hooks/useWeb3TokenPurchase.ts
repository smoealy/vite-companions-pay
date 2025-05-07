
import { useState } from 'react';
import { ethers } from 'ethers';
import { logTokenPurchase } from '@/firestore';
import { useToast } from '@/hooks/use-toast';
import { checkSaleRequirements } from '@/utils/tokenSaleUtils';
import { 
  TOKEN_SALE_ADDRESS, 
  TOKEN_SALE_ABI, 
  MIN_CONTRIBUTION_ETH, 
  SEPARATOR_ADDRESS 
} from '@/lib/tokenSaleConstants';

export function useWeb3TokenPurchase(refreshBalance: () => Promise<void>) {
  const { toast } = useToast();
  const [processingWeb3, setProcessingWeb3] = useState(false);
  const [currentRate, setCurrentRate] = useState<number>(0);

  // Get the current token rate from the contract
  const fetchCurrentRate = async (): Promise<number> => {
    if (!window.ethereum) {
      return 0;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const sale = new ethers.Contract(TOKEN_SALE_ADDRESS, TOKEN_SALE_ABI, signer);
      
      const roundDetails = await sale.getCurrentRound();
      const rate = Number(roundDetails.rate);
      setCurrentRate(rate);
      return rate;
    } catch (error) {
      console.error("Error fetching token rate:", error);
      return 0;
    }
  };

  const handleWeb3Purchase = async (ethAmount: string) => {
    if (!window.ethereum) {
      toast({
        title: "Web3 Wallet Required",
        description: "Please install a Web3 wallet like MetaMask to purchase tokens directly.",
        variant: "destructive",
      });
      return false;
    }

    if (!ethAmount || isNaN(parseFloat(ethAmount)) || parseFloat(ethAmount) <= 0) {
      toast({
        title: "Invalid ETH Amount",
        description: "Please enter a valid ETH amount.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setProcessingWeb3(true);
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Get current round details to check minimum contribution
      const sale = new ethers.Contract(TOKEN_SALE_ADDRESS, TOKEN_SALE_ABI, signer);
      
      console.log("Fetching current round details...");
      const roundDetails = await sale.getCurrentRound();
      const rate = Number(roundDetails.rate);
      setCurrentRate(rate);
      
      console.log("Current sale round:", {
        active: roundDetails.active,
        rate: rate.toString(),
        minContribution: ethers.utils.formatEther(roundDetails.minContribution) + " ETH",
        maxContribution: ethers.utils.formatEther(roundDetails.maxContribution) + " ETH",
        cap: ethers.utils.formatEther(roundDetails.cap) + " ETH",
        raised: ethers.utils.formatEther(roundDetails.raised) + " ETH"
      });
      
      // Convert input ETH string to wei BigNumber
      const ethValueInWei = ethers.utils.parseEther(ethAmount);
      
      // Debug wallet info
      const address = await signer.getAddress();
      const ethBalance = await provider.getBalance(address);
      console.log("Buyer wallet:", {
        address,
        ethBalance: ethers.utils.formatEther(ethBalance) + " ETH",
        sendingWei: ethValueInWei.toString(),
        sendingEth: ethers.utils.formatEther(ethValueInWei) + " ETH",
        rate: rate,
        estimatedTokens: parseFloat(ethAmount) * rate,
        separatorAddress: SEPARATOR_ADDRESS
      });
      
      // Check min contribution directly from the contract
      if (ethValueInWei.lt(roundDetails.minContribution)) {
        throw new Error(`Amount below minimum contribution of ${ethers.utils.formatEther(roundDetails.minContribution)} ETH`);
      }
      
      // Pre-check if the transaction is likely to succeed
      const checkResult = await checkSaleRequirements(signer, ethValueInWei);
      if (!checkResult.valid) {
        throw new Error(`Sale requirements not met: ${checkResult.reason}`);
      }
      
      // Calculate estimated token amount for confirmation
      const estimatedTokens = parseFloat(ethAmount) * rate;
      
      // Add a confirmation dialog with more details
      const confirmTx = window.confirm(
        `You are about to send ${ethAmount} ETH to purchase approximately ${estimatedTokens.toLocaleString()} IHRAM tokens.\n\n` + 
        `Token Rate: 1 ETH = ${rate} IHRAM\n` +
        `Minimum Contribution: ${ethers.utils.formatEther(roundDetails.minContribution)} ETH\n\n` +
        `ETH will be forwarded to: ${SEPARATOR_ADDRESS.substring(0, 8)}...${SEPARATOR_ADDRESS.substring(36)}\n\n` +
        `Continue?`
      );
      
      if (!confirmTx) {
        setProcessingWeb3(false);
        return false;
      }
      
      // Use a direct contract call
      console.log("Calling buyTokens() with value:", ethers.utils.formatEther(ethValueInWei), "ETH");
      const transaction = await sale.buyTokens({ 
        value: ethValueInWei,
        gasLimit: 150000 // Increased gas limit to account for ETH forwarding
      });
      
      console.log("Transaction sent:", transaction.hash);
      
      // Wait for transaction confirmation
      const receipt = await transaction.wait();
      console.log("Transaction confirmed:", receipt);
      
      // Check if transaction was successful
      if (receipt.status === 0) {
        throw new Error("Transaction failed on-chain");
      }
      
      // Log the purchase to Firestore for tracking
      await logTokenPurchase({
        amountUsd: estimatedTokens, // Using token amount as USD equivalent (1:1)
        tokenAmount: estimatedTokens,
        timestamp: new Date(),
        paymentMethod: 'web3',
        status: 'completed',
        walletAddress: address,
        transactionHash: transaction.hash
      });
      
      // Refresh the token balance
      await refreshBalance();
      
      toast({
        title: "Tokens Purchased!",
        description: `Successfully purchased approximately ${estimatedTokens.toLocaleString()} IHRAM tokens.`,
        duration: 5000,
      });
      
      return true;
    } catch (error: any) {
      console.error("Web3 purchase error:", error);
      
      // Provide more helpful error messages based on the error
      let errorMessage = error.message || "There was an error processing your Web3 transaction.";
      
      // Check for common error patterns
      if (errorMessage.includes("user rejected")) {
        errorMessage = "Transaction was rejected in your wallet";
      } else if (errorMessage.includes("cap")) {
        errorMessage = "Sale cap has been reached";
      } else if (errorMessage.includes("min contribution")) {
        errorMessage = `Amount is below minimum contribution of ${MIN_CONTRIBUTION_ETH} ETH`;
      } else if (errorMessage.includes("max contribution")) {
        errorMessage = "Amount exceeds maximum contribution";
      } else if (errorMessage.includes("transfer failed")) {
        errorMessage = "Token transfer failed. The sale contract may not have enough tokens";
      } else if (errorMessage.includes("gas required exceeds")) {
        errorMessage = "Transaction requires more gas than provided. Please try with a higher gas limit.";
      } else if (errorMessage.includes("CALL_EXCEPTION")) {
        errorMessage = "Transaction reverted by the contract. This may be because ETH forwarding to the separator address failed.";
      }
      
      toast({
        title: "Purchase Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setProcessingWeb3(false);
    }
  };

  return {
    handleWeb3Purchase,
    fetchCurrentRate,
    currentRate,
    processingWeb3
  };
}
