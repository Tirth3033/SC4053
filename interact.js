const { Web3 } = require('web3');

// Set up the connection to Ganache
const web3 = new Web3('http://127.0.0.1:8545');  // Use your Ganache URL and port

// Define the deployed contract address
const deployedAddress = "0x410C977734a285Be02FF0432556F8436bdF13D2f";

// Load the ABI of your DutchAuction contract
const abi = require('./build/contracts/DutchAuction.json').abi;
const myContract = new web3.eth.Contract(abi, deployedAddress);

async function interact() {
  try {
    // Example: Call the currentPrice view function
    const currentPrice = await myContract.methods.currentPrice().call();
    console.log('Current Price:', currentPrice);
  } catch (error) {
    console.error('Error fetching current price:', error.message || error);
  }
}

interact();
