const AuctionToken = artifacts.require("AuctionToken");
const DutchAuction = artifacts.require("DutchAuction");

module.exports = async function (deployer) {
    await deployer.deploy(AuctionToken, 1000000); // Deploy AuctionToken with an initial supply
    const tokenInstance = await AuctionToken.deployed();
    // Define initial parameters for DutchAuction
    const initialPrice = web3.utils.toWei('2', 'ether');      // Starting price in wei (e.g., 1 ether)
    const reservePrice = web3.utils.toWei('0.1', 'ether');    // Minimum price in wei (e.g., 0.1 ether)
    const priceDecreaseInterval = 1;                         // Price decrease interval in seconds (1 minute)
    const duration = 1200;                                    // Auction duration in seconds (20 minutes)
    const totalTokens = 1000;                                 // Total tokens in the auction

    // Calculate the priceDecreaseRate safely using BigNumbers
    const initialPriceBN = web3.utils.toBN(initialPrice);
    const reservePriceBN = web3.utils.toBN(reservePrice);
    const numIntervals = Math.floor(duration / priceDecreaseInterval);
    const numIntervalsBN = web3.utils.toBN(numIntervals);

    const priceDecreaseRateBN = initialPriceBN.sub(reservePriceBN).div(numIntervalsBN);

    // Deploy DutchAuction with calculated priceDecreaseRate as a BigNumber string
    await deployer.deploy(
        DutchAuction,
        tokenInstance.address,
        initialPriceBN.toString(),
        reservePriceBN.toString(),
        priceDecreaseRateBN.toString(),
        priceDecreaseInterval,
        duration,
        totalTokens
    );
};
