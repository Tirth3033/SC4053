const { Web3 } = require('web3');

// Set up the connection to Ganache
const web3 = new Web3('http://127.0.0.1:8545');  // Use your Ganache URL and port

// Define the deployed contract address
const deployedAddress = "0x377EC75D8c01DCdb4503d5cc68603A7701B84a9d";

// Load the ABI of your DutchAuction contract
const abi = require('./build/contracts/DutchAuction.json').abi;
const myContract = new web3.eth.Contract(abi, deployedAddress);

async function interact() {
  try {
    // Example: Call the currentPrice view function
    let accounts = web3.eth.getAccounts();
    let sampleAccount = '0xbe063EF92aFA47dBc33eCdd81a35633E63703983';
    const currentPrice = await myContract.methods.currentPrice({from: sampleAccount}).call();
    const bal = await web3.eth.getBalance(sampleAccount);
    let balanceBefore = await web3.eth.getBalance(sampleAccount);
    console.log("Balance Before:", web3.utils.fromWei(balanceBefore, 'ether'), 'ETH');

    const txData = myContract.methods.buyTokens().encodeABI();
    const tx = {
      to: deployedAddress,
      data: txData,
      from: sampleAccount,
      value: web3.utils.toWei('1', 'ether'),  // Sending 1 ether to buy tokens
      gas: 3000000
    };
    

    const signedTx = await web3.eth.accounts.signTransaction(tx, '0x55b19608dfc8bc0f8e96b834234c2ae88861009b0eaf934052442191b443c2ac');

    let balanceAfter = await web3.eth.getBalance(sampleAccount);
    console.log("Balance After:", web3.utils.fromWei(balanceAfter, 'ether'), 'ETH');
  } catch (error) {
    console.error('Error fetching current price:', error.message || error);
  }
}

interact();
