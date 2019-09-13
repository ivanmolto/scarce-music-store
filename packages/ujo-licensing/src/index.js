const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const axios = require('axios');
const LicenseContract = require('./LicenseCore.json');

let web3;
let accounts;
let currentNetwork;
let serverAddress;

let contractAddress;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

let challenge;
let signature;

// production
if (window.location.hostname == 'TODO') {
  contractAddress = '';
  serverAddress = '';
}
// dev
else {
  contractAddress = ''; // dev
  serverAddress = 'http://localhost:3001';
}

/**
 * Adds a 5% boost to the gas for web3 calls as to ensure tx's go through
 *
 * @param {string} estimatedGas amount of gas required from `estimateGas`
 */
const boostGas = estimatedGas => {
  const gasBoost = new BigNumber(estimatedGas, 10).div(new BigNumber('20')).floor();
  return new BigNumber(estimatedGas, 10).add(gasBoost).floor();
};

/**
 * Converts dollars to wei based on exchange rate
 *
 * @param {string} dollarToWei amoutn of dollars to be converted to wei
 */
const dollarToWei = (dollarAmount, exchangeRate) =>
  new BigNumber('1000000000000000000', 10)
    .divRound(new BigNumber(exchangeRate, 10))
    .mul(new BigNumber(dollarAmount, 10));

/**
 * Helper to generate durations
 *
 * @param {int} val amount of duration type
 */
const duration = {
  seconds(val) {
    return val;
  },
  minutes(val) {
    return val * this.seconds(60);
  },
  hours(val) {
    return val * this.minutes(60);
  },
  days(val) {
    return val * this.hours(24);
  },
  weeks(val) {
    return val * this.days(7);
  },
  years(val) {
    return val * this.days(365);
  },
};

async function initWeb3() {
  // use Metamask, et al. if available
  // If no injected web3 instance is detected, fallback to Ganache CLI.
  const provider = web3 !== undefined ? web3.currentProvider : new Web3.providers.HttpProvider('http://127.0.0.1:8545');
  web3 = new Web3(provider);
  accounts = await web3.eth.getAccounts();
  currentNetwork = await web3.eth.net.getId();
}

const deploy = async () => {
  accounts = await web3.eth.getAccounts();
  const abi = new web3.eth.Contract(LicenseContract.abi);
  const estimatedGas = await abi
    .deploy({
      data: LicenseContract.bytecode,
    })
    .estimateGas();

  console.log('Attempting to deploy from account', accounts[0]);
  console.log('Gas', estimatedGas);

  const result = await new web3.eth.Contract(LicenseContract.abi)
    .deploy({ data: LicenseContract.bytecode })
    .send({ gas: boostGas(estimatedGas), from: accounts[0] });
  console.log('Contract deployed to', result.options.address);

  contractAddress = result.options.address;

  // Update address on server
  let res;
  try {
    res = await axios.post(`${serverAddress}/update-address`, { address: contractAddress });
  } catch (error) {
    console.log(error);
  }
  console.log(res);
};

async function updateProducts(productIds) {
  const select = document.getElementById('productIds');
  // Clear old values first
  while (select.options.length > 0) {
    select.remove(0);
  }
  // Then populate
  for (let i = 0; i < productIds.length; i++) {
    const opt = productIds[i];
    const el = document.createElement('option');
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
  }
}

async function createProduct() {
  // if (!LicenseContract.networks[currentNetwork] || !LicenseContract.networks[currentNetwork].address) {
  //   throw new Error(`LicenseCore.json doesn't contain an entry for the current network ID (${currentNetwork})`);
  // }
  // console.log(currentNetwork);
  // console.log(LicenseContract.networks[currentNetwork].address);

  const productId = document.getElementById('id').value;
  const price = document.getElementById('price').value;
  const inventory = document.getElementById('inventory').value;

  const ContractInstance = new web3.eth.Contract(LicenseContract.abi, contractAddress);
  const firstProduct = {
    id: productId,
    price,
    initialInventory: inventory,
    supply: inventory,
    interval: 0,
  };

  const estimatedGas = await ContractInstance.methods
    .createProduct(
      firstProduct.id,
      firstProduct.price,
      firstProduct.initialInventory,
      firstProduct.supply,
      firstProduct.interval,
    )
    .estimateGas({
      from: accounts[0],
    });

  const gas = boostGas(estimatedGas);
  const obj = await ContractInstance.methods
    .createProduct(
      firstProduct.id,
      firstProduct.price,
      firstProduct.initialInventory,
      firstProduct.supply,
      firstProduct.interval,
    )
    .send({
      gas,
      from: accounts[0],
      to: contractAddress,
    });

  const p = await ContractInstance.methods.productInfo(firstProduct.id).call();
  console.log(p);

  const productIds = await ContractInstance.methods.getAllProductIds().call();
  updateProducts(productIds);
  console.log(productIds);
}

async function createLicense() {
  // console.log(currentNetwork);
  // console.log(LicenseContract.networks[currentNetwork].address);
  const ContractInstance = new web3.eth.Contract(LicenseContract.abi, contractAddress);
  const e = document.getElementById('productIds');
  const productId = e.options[e.selectedIndex].value;

  const productInfo = await ContractInstance.methods.productInfo(productId).call();
  console.log(productInfo);
  const estimatedGas = await ContractInstance.methods.purchase(productId, 1, accounts[0], ZERO_ADDRESS).estimateGas({
    from: accounts[0],
    value: productInfo.price, // price
  });

  const gas = boostGas(estimatedGas);
  const license = await ContractInstance.methods.purchase(productId, 1, accounts[0], ZERO_ADDRESS).send({
    gas,
    from: accounts[0],
    value: productInfo.price,
  });

  console.log(license);
  console.log(license.events.LicenseIssued.returnValues.licenseId);

  const owner = await ContractInstance.methods.ownerOf(license.events.LicenseIssued.returnValues.licenseId).call();
  console.log(owner);
}

async function requestChallenge() {
  let res;
  try {
    res = await axios.get(`${serverAddress}/auth/${accounts[0]}`);
    const { data } = res;
  } catch (error) {
    console.log(error);
  }

  challenge = res;

  // TODO - SignTgpedData
  // const typedData = {
  //   types: {
  //     EIP712Domain: [
  //       { name: 'name', type: 'string' },
  //       { name: 'version', type: 'string' },
  //       { name: 'chainId', type: 'uint256' },
  //       { name: 'verifyingContract', type: 'address' },
  //     ],
  //     Person: [{ name: 'name', type: 'string' }, { name: 'wallet', type: 'address' }],
  //     Mail: [{ name: 'from', type: 'Person' }, { name: 'to', type: 'Person' }, { name: 'contents', type: 'string' }],
  //   },
  //   primaryType: 'Mail',
  //   domain: {
  //     name: 'Ether Mail',
  //     version: '1',
  //     chainId: 1,
  //     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  //   },
  //   message: {
  //     from: {
  //       name: 'Cow',
  //       wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
  //     },
  //     to: {
  //       name: 'Bob',
  //       wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
  //     },
  //     contents: 'Hello, Bob!',
  //   },
  // };

  // const params = [accounts[0], typedData];
  // try {
  //   signature = await web3.currentProvider.send('eth_signTypedData', params);
  //   console.log(signature);
  // } catch (err) {
  //   console.log(err);
  // }

  try {
    // signature = await web3.eth.sign(challenge, accounts[0]);
    signature = await web3.eth.sign('test', accounts[0]);
  } catch (err) {
    console.log(err);
  }
  // console.log(challenge);
  console.log(signature);
}

async function verifyOwnership() {
  let res;
  try {
    res = await axios.get(`${serverAddress}/auth/test/${signature}`);
    const { data } = res;
    console.log(data);
  } catch (error) {
    console.log(error);
  }

  // console.log(res);
  // console.log(res.data);
  console.log(accounts[0]);
  // Check if signer is the same
  if (res && res.data && res.data === accounts[0].toLowerCase()) {
    console.log('Success!');
  } else {
    console.log('Denied!');
  }
}

async function initEventListeners() {
  document.querySelector('#deploy').addEventListener('click', async () => {
    await deploy();
  });

  document.querySelector('#create-product').addEventListener('click', async () => {
    await createProduct();
  });

  document.querySelector('#purchase').addEventListener('click', async () => {
    await createLicense();
  });

  document.querySelector('#challenge').addEventListener('click', async () => {
    await requestChallenge();
  });

  document.querySelector('#verify').addEventListener('click', async () => {
    await verifyOwnership();
  });
}

const getContractAddress = (contractInterface, currentNetwork) => {
  const network = currentNetwork.toString();
  return contractInterface.networks[network].address;
};

async function main() {
  await initWeb3();
  await initEventListeners();
}

main();
