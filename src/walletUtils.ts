
import { ethers } from "ethers";

// Properly formatted token ABI for viem/ethers compatibility
const tokenABI = [
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

// Update to the correct IHRAM token address on Sepolia
const tokenAddress = "0x2f4FB395cF2a622fAE074f7018563494072d1D95";

export async function getIHRAMBalance(walletAddress: string): Promise<string> {
  // For TypeScript safety, we check if window.ethereum exists
  if (typeof window.ethereum !== 'undefined') {
    try {
      console.log("Fetching IHRAM balance for wallet:", walletAddress);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, tokenABI, provider);
      
      // First check if we can get decimals, fallback to 18 if not available
      let decimals = 18;
      try {
        decimals = await contract.decimals();
        console.log("IHRAM token decimals:", decimals);
      } catch (error) {
        console.log("Could not fetch token decimals, using default 18");
      }
      
      const balance = await contract.balanceOf(walletAddress);
      console.log("Raw IHRAM balance fetched:", balance.toString());
      return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Error getting IHRAM balance from walletUtils:", error);
      return "0";
    }
  }
  // Return "0" as fallback if ethereum is not available
  console.log("Ethereum provider not available in walletUtils");
  return "0";
}

// Add a TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
