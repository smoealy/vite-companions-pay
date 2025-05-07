
import { ethers } from 'ethers';
import { TOKEN_SALE_ADDRESS, TOKEN_SALE_ABI, SEPARATOR_ADDRESS } from '@/lib/tokenSaleConstants';
import { tokenAddress, tokenAbi } from '@/lib/tokenAbi';

// Check if the sale round is active and meets requirements
export const checkSaleRequirements = async (signer: ethers.Signer, ethValueInWei: ethers.BigNumber) => {
  try {
    const sale = new ethers.Contract(TOKEN_SALE_ADDRESS, TOKEN_SALE_ABI, signer);
    const token = new ethers.Contract(tokenAddress, tokenAbi, signer);
    
    // Get current round details
    const round = await sale.getCurrentRound();
    console.log("Current Sale Round:", {
      active: round.active,
      rate: round.rate.toString(),
      minContribution: ethers.utils.formatEther(round.minContribution) + " ETH",
      maxContribution: ethers.utils.formatEther(round.maxContribution) + " ETH", 
      cap: ethers.utils.formatEther(round.cap) + " ETH",
      raised: ethers.utils.formatEther(round.raised) + " ETH",
      separatorAddress: SEPARATOR_ADDRESS
    });
    
    // Check if round is active
    if (!round.active) {
      return { valid: false, reason: "Sale round is not currently active" };
    }
    
    // Check minimum contribution
    if (ethValueInWei.lt(round.minContribution)) {
      return { 
        valid: false, 
        reason: `Contribution too low. Minimum: ${ethers.utils.formatEther(round.minContribution)} ETH` 
      };
    }
    
    // Check user's current contribution
    const address = await signer.getAddress();
    const userContribution = await sale.contributions(address);
    const totalAfterPurchase = userContribution.add(ethValueInWei);
    
    // Check maximum contribution
    if (totalAfterPurchase.gt(round.maxContribution)) {
      return { 
        valid: false, 
        reason: `Exceeds maximum contribution limit of ${ethers.utils.formatEther(round.maxContribution)} ETH` 
      };
    }
    
    // Check cap
    if (round.raised.add(ethValueInWei).gt(round.cap)) {
      return { valid: false, reason: "Sale cap would be exceeded" };
    }
    
    // Check if contract has enough tokens
    const saleBalance = await token.balanceOf(TOKEN_SALE_ADDRESS);
    const tokensNeeded = ethValueInWei.mul(round.rate);
    
    if (saleBalance.lt(tokensNeeded)) {
      return { 
        valid: false, 
        reason: `Not enough tokens in sale contract. Available: ${ethers.utils.formatUnits(saleBalance, 18)}` 
      };
    }
    
    return { valid: true };
  } catch (error) {
    console.error("Error checking sale requirements:", error);
    return { valid: false, reason: "Failed to check sale requirements" };
  }
};
