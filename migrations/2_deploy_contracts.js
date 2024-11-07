const AuctionToken = artifacts.require("AuctionToken");
const DutchAuction = artifacts.require("DutchAuction");

module.exports = async function (deployer, network, accounts) {
    const totalTokens = 100;
    const initialPrice = web3.utils.toWei('2', 'ether');      // Starting price in wei (e.g., 2 ether)
    const reservePrice = web3.utils.toWei('0.1', 'ether');    // Minimum price in wei (e.g., 0.1 ether)
    const priceDecreaseInterval = 1;                          // Price decrease interval in seconds (1 second)
    const duration = 200;                                     // Auction duration in seconds (200 seconds)

    // Calculate the priceDecreaseRate safely using BigNumbers
    const initialPriceBN = web3.utils.toBN(initialPrice);
    const reservePriceBN = web3.utils.toBN(reservePrice);
    const numIntervals = Math.floor(duration / priceDecreaseInterval);
    const numIntervalsBN = web3.utils.toBN(numIntervals);

    const priceDecreaseRateBN = initialPriceBN.sub(reservePriceBN).div(numIntervalsBN);

    // Deploy AuctionToken with an initial supply
    await deployer.deploy(AuctionToken, totalTokens);
    const tokenInstance = await AuctionToken.deployed();

    // Deploy DutchAuction with calculated parameters
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
    const auctionInstance = await DutchAuction.deployed();

    // Approve the DutchAuction contract to transfer tokens on behalf of the seller
    await tokenInstance.approve(auctionInstance.address, totalTokens, { from: accounts[0] });

    // Transfer tokens from the seller (deployer) to the DutchAuction contract
    await tokenInstance.transfer(auctionInstance.address, totalTokens, { from: accounts[0] });

    console.log("DutchAuction deployed with AuctionToken approved and tokens transferred.");
};
