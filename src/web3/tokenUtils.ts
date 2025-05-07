
import { ethers } from "ethers";

// Properly formatted token ABI
const tokenAbi = [
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
  },
  {
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "redeem",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable", 
    "type": "function"
  }
];

// Update to the correct IHRAM token address on Sepolia
const tokenAddress = "0x2f4FB395cF2a622fAE074f7018563494072d1D95"; 

export async function getIHRAMBalance(walletAddress: string) {
  if (typeof window.ethereum !== 'undefined') {
    try {
      console.log("Fetching balance for wallet:", walletAddress);
      // Use ethers v5 syntax to connect to provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, tokenAbi, provider);
      
      // First check if we can get decimals, fallback to 18 if not available
      let decimals = 18;
      try {
        const rawDecimals = await contract.decimals();
        // Ensure decimals is treated as a number, not BigInt
        decimals = Number(rawDecimals);
        console.log("Token decimals:", decimals);
      } catch (error) {
        console.log("Could not fetch token decimals, using default 18");
      }
      
      const balance = await contract.balanceOf(walletAddress);
      console.log("Raw balance from tokenUtils:", balance.toString());
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);
      console.log("Formatted balance:", formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error("Error fetching IHRAM balance from tokenUtils:", error);
      return "0";
    }
  }
  console.log("Ethereum provider not available in tokenUtils");
  return "0";
}

export async function redeemTokens(amount: string) {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, tokenAbi, signer);
      
      // Get decimals to format amount correctly
      let decimals = 18;
      try {
        const rawDecimals = await contract.decimals();
        // Ensure decimals is treated as a number, not BigInt
        decimals = Number(rawDecimals);
      } catch (error) {
        console.log("Could not fetch token decimals for redemption, using default 18");
      }
      
      // Use a safe gas limit estimation approach
      const amountBigNumber = ethers.utils.parseUnits(amount, decimals);
      
      // If you're having issues with gas estimation, you can use a fixed gas limit
      const gasEstimateOptions = {
        gasLimit: ethers.utils.hexlify(300000) // Safe fixed gas limit
      };
      
      const tx = await contract.redeem(amountBigNumber, gasEstimateOptions);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error redeeming tokens:", error);
      throw new Error("Failed to redeem tokens");
    }
  }
  throw new Error("Ethereum provider not found");
}

// Add window.ethereum type declaration
declare global {
  interface Window {
    ethereum?: any;
  }
}
