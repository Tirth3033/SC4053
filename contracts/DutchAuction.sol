// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AuctionToken.sol";

contract DutchAuction {
    AuctionToken public auctionToken;
    address payable public seller;
    uint public initialPrice;
    uint public reservePrice;
    uint public priceDecreaseRate;
    uint public priceDecreaseInterval;
    uint public auctionStartTime;
    uint public auctionEndTime;
    uint public totalTokens; // Total tokens available in the auction
    bool public ended;
    uint public finalPrice; // This will store the final confirmed price

    struct Bidder {
        uint investedAmount; // Amount invested by the bidder
        uint tokensOwned;    // Tokens to be allocated to the bidder
    }

    mapping(address => Bidder) public bidders;
    address[] private bidderAddresses;

    event TokensPurchased(address bidder, uint amountInvested, uint tokensToBeAllocated);
    event TokensDistributed(address bidder, uint tokensAllocated, uint amountRefunded);
    event AuctionEnded(uint finalPrice);

    constructor(
        address _tokenAddress,
        uint _initialPrice,
        uint _reservePrice,
        uint _priceDecreaseRate,
        uint _priceDecreaseInterval,
        uint _duration,
        uint _totalTokens
    ) {
        auctionToken = AuctionToken(_tokenAddress);
        seller = payable(msg.sender);
        initialPrice = _initialPrice;
        reservePrice = _reservePrice;
        priceDecreaseRate = _priceDecreaseRate;
        priceDecreaseInterval = _priceDecreaseInterval;
        auctionStartTime = block.timestamp;
        auctionEndTime = auctionStartTime + _duration;
        totalTokens = _totalTokens;
    }

    // Calculate the current price based on time elapsed and decrease rate
    function currentPrice() public view returns (uint) {
    if (block.timestamp <= auctionEndTime) {
        uint elapsed = block.timestamp - auctionStartTime;
        uint priceDecrease = (elapsed / priceDecreaseInterval) * priceDecreaseRate;
        uint _currentPrice = initialPrice > priceDecrease ? initialPrice - priceDecrease : reservePrice;
        return _currentPrice > reservePrice ? _currentPrice : reservePrice;
    } else {
        return reservePrice;
    }
}

    // Function to buy tokens at the current price
function buyTokens() external payable {
    require(block.timestamp <= auctionEndTime, "Auction has already ended.");
    require(!ended, "Auction already ended.");
    require(msg.value > 0, "No ether sent");  // Check if value is greater than zero
    
    uint _currentPrice = currentPrice();
    require(_currentPrice > 0, "Current price is zero");  // Ensure current price is non-zero

    uint tokensToBuy = msg.value / _currentPrice;
    require(tokensToBuy > 0, "Insufficient funds to buy tokens");

    if (tokensToBuy >= totalTokens) {
        tokensToBuy = totalTokens;
    }

    // Update bidder's record in the struct
    if (bidders[msg.sender].investedAmount == 0 && bidders[msg.sender].tokensOwned == 0) {
        bidderAddresses.push(msg.sender);
    }
    bidders[msg.sender].investedAmount += msg.value;
    bidders[msg.sender].tokensOwned += tokensToBuy;
    totalTokens -= tokensToBuy;

    emit TokensPurchased(msg.sender, msg.value, tokensToBuy);

    if (totalTokens == 0 || block.timestamp >= auctionEndTime) {
        finalizeAuction(_currentPrice);
    }
}


    // Finalize the auction, distribute tokens and refund excess funds
    function finalizeAuction(uint fP) private {
        ended = true;
        finalPrice = fP;
        for (uint i = 0; i < bidderAddresses.length; i++) {
            Bidder storage bidder = bidders[bidderAddresses[i]];
            uint totalCost = bidder.tokensOwned * finalPrice;
            uint refund = bidder.investedAmount > totalCost ? bidder.investedAmount - totalCost : 0;

            if (refund > 0) {
                payable(bidderAddresses[i]).transfer(refund);
            }

            auctionToken.transfer(bidderAddresses[i], bidder.tokensOwned);
            emit TokensDistributed(bidderAddresses[i], bidder.tokensOwned, refund);
        }
        payable(seller).transfer(finalPrice * totalTokens);

        emit AuctionEnded(finalPrice);
    }

}
