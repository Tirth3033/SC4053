// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AuctionToken.sol";

contract DutchAuction {
    address payable public seller;
    uint public initialPrice;
    uint public reservePrice;
    uint public priceDecreaseRate;
    uint public auctionEndTime;
    uint public priceDecreaseInterval;
    uint public totalTokens;  // Total tokens available in the auction
    bool public ended;

    struct Bidder {
        uint investedAmount; // Amount invested by the bidder
        uint tokensOwned;    // Tokens allocated to the bidder
    }

    mapping(address => Bidder) public bidders;

    event TokensPurchased(address bidder, uint amountInvested, uint tokensAllocated);
    event ExcessRefunded(address bidder, uint amountRefunded);
    event AuctionEnded();

    constructor(
        uint _initialPrice,
        uint _reservePrice,
        uint _priceDecreaseRate,
        uint _priceDecreaseInterval,
        uint _duration,
        uint _totalTokens
    ) {
        seller = payable(msg.sender);
        initialPrice = _initialPrice;
        reservePrice = _reservePrice;
        priceDecreaseRate = _priceDecreaseRate;
        priceDecreaseInterval = _priceDecreaseInterval;
        auctionEndTime = block.timestamp + _duration;
        totalTokens = _totalTokens;
    }

    // Calculate the current price based on time elapsed and decrease rate
    function currentPrice() public view returns (uint) {
        if (block.timestamp <= auctionEndTime) {
            uint elapsed = block.timestamp + priceDecreaseInterval - auctionEndTime; // Adjust this line to calculate elapsed time since auction start properly.
            if (elapsed < 0) {
                return initialPrice; // Return initial price if the auction has not started yet
            }
            uint priceDecrease = (elapsed / priceDecreaseInterval) * priceDecreaseRate;
            uint _currentPrice = initialPrice > priceDecrease ? initialPrice - priceDecrease : reservePrice;
            return _currentPrice > reservePrice ? _currentPrice : reservePrice;
        } else {
            return reservePrice;
        }
    }


    // Function to buy tokens at the current price or reserve price when auction ends
    function buyTokens() external payable {
        require(block.timestamp <= auctionEndTime, "Auction has already ended.");
        require(!ended, "Auction already ended.");
        
        uint _currentPrice = currentPrice();
        uint tokensToBuy = msg.value / _currentPrice;
        require(tokensToBuy <= totalTokens, "Not enough tokens available");

        if (tokensToBuy >= totalTokens) {
            uint totalCost = totalTokens * _currentPrice;
            uint refundAmount = msg.value - totalCost;
            bidders[msg.sender].investedAmount += totalCost;
            bidders[msg.sender].tokensOwned += totalTokens;
            totalTokens = 0;
            ended = true;

            if (refundAmount > 0) {
                payable(msg.sender).transfer(refundAmount);
                emit ExcessRefunded(msg.sender, refundAmount);
            }
            emit TokensPurchased(msg.sender, totalCost, totalTokens);
        } else {
            bidders[msg.sender].investedAmount += msg.value;
            bidders[msg.sender].tokensOwned += tokensToBuy;
            totalTokens -= tokensToBuy;
            emit TokensPurchased(msg.sender, msg.value, tokensToBuy);
        }

        if (totalTokens == 0) {
            ended = true;
            emit AuctionEnded();
        }
    }

    // Finalize auction and transfer funds
    function finalize() external {
        require(ended, "Auction has not ended yet.");
        require(msg.sender == seller, "Only seller can finalize.");
        
        seller.transfer(address(this).balance);
    }
}
