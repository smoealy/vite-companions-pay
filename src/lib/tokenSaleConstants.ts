
// Token sale contract address (separate from the token contract)
export const TOKEN_SALE_ADDRESS = "0xa703b6393b0caf374cb7ebe2eb760bb372f38d82";

// Separator address that should receive the ETH
export const SEPARATOR_ADDRESS = "0x2e16f639d8f47960060aDf955122C2C1880aF0a6";

// Minimal ABI for IhramTokenSale contract
export const TOKEN_SALE_ABI = [
  "function getCurrentRound() external view returns (tuple(bool active, uint256 rate, uint256 minContribution, uint256 maxContribution, uint256 cap, uint256 raised, address vestingAddress))",
  "function buyTokens() public payable",
  "function contributions(address) external view returns (uint256)"
];

// Minimum contribution in ETH (this will be overridden by contract value but serves as initial fallback)
export const MIN_CONTRIBUTION_ETH = "0.01";

// Format ETH amount for display with proper precision
export const formatEthAmount = (ethAmount: string) => {
  return parseFloat(ethAmount).toFixed(6);
};

// Calculate approximate token amount based on ETH input and rate
export const getTokenAmount = (ethAmount: string, rate: number) => {
  // ethAmount * rate = IHRAM token amount
  if (!ethAmount || isNaN(parseFloat(ethAmount)) || !rate) return "0";
  return (parseFloat(ethAmount) * rate).toLocaleString();
};
