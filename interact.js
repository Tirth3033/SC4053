const { Web3 } = require('web3');

// Set up the connection to Ganache
const web3 = new Web3('http://127.0.0.1:8545');  // Use your Ganache URL and port

// Define the deployed contract address
const deployedAddress = "0x0FD198170C89B1597227485BF2466ea4630cd1f5";

// Load the ABI of your DutchAuction contract
const abi = require('./build/contracts/DutchAuction.json').abi;
const myContract = new web3.eth.Contract(abi, deployedAddress);

async function interact() {
  try {
    // Example: Call the currentPrice view function
    let accounts = web3.eth.getAccounts();
    let sampleAccount = '0x57821E17b16E6072a8a2D4b9770019943A955106';
    const currentPrice = await myContract.methods.currentPrice({from: sampleAccount}).call();
    const totalTokens = await myContract.methods.totalTokens({from: sampleAccount}).call();    
    const auctionStartTime = await myContract.methods.auctionStartTime({from: sampleAccount}).call();    
    const auctionEndTime = await myContract.methods.auctionEndTime({from: sampleAccount}).call();    
    const bal = await web3.eth.getBalance(sampleAccount);
    let balanceBefore = await web3.eth.getBalance(sampleAccount);
    let contractBalance = await web3.eth.getBalance(deployedAddress);
    console.log("Balance Before:", web3.utils.fromWei(balanceBefore, 'ether'), 'ETH');
    console.log("Contract balance:", web3.utils.fromWei(contractBalance, 'ether'), 'ETH');
    console.log("current Price:", web3.utils.fromWei(currentPrice, 'ether'), 'ETH');
    console.log("Tokens left:", totalTokens);
    console.log("Auction Start Time:", auctionStartTime);
    console.log("Auction End TIme:", auctionEndTime);
    const unixTime = Math.floor(Date.now() / 1000);
    console.log(unixTime);


    const tx = await myContract.methods.buyTokens().send({
      from: sampleAccount,     // Replace with the appropriate account
      value: web3.utils.toWei('', 'ether'),  // Replace with the amount of ether to send
       gas: 3000000 
    });
    // console.log("Transaction receipt:", tx);
    // const signedTx = await web3.eth.accounts.signTransaction(tx, '0x22a919dcc2aa546c225477cc9a2e035ad2d51f1bb0da784d86170db844aa6527');

    let balanceAfter = await web3.eth.getBalance(sampleAccount);
    console.log("Balance After:", web3.utils.fromWei(balanceAfter, 'ether'), 'ETH');
    const currentPriceAfter = await myContract.methods.currentPrice({from: sampleAccount}).call();
    const totalTokensAfter = await myContract.methods.totalTokens({from: sampleAccount}).call();    

    let contractBalanceAfter = await web3.eth.getBalance(deployedAddress);
    console.log("Contract balance After:", web3.utils.fromWei(contractBalanceAfter, 'ether'), 'ETH');
    console.log("current Price After:", web3.utils.fromWei(currentPriceAfter, 'ether'), 'ETH');
    console.log("Tokens left After:", totalTokensAfter);

  } catch (error) {
    console.error('ERROR :', error.message || error);
  }
}

interact();
