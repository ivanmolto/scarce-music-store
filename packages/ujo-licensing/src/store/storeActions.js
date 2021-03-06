import { ethers } from 'ethers'
import axios from 'axios'
import LicensingHelper from '../../UjoLicensingClass'
import * as fetch from '../fetch'

const serverAddress = 'http://localhost:3001'

let UjoLicensing

// actions
export const initWeb3 = () => async (dispatch) => {
  let provider
  let accounts
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum)
    accounts = await window.ethereum.enable()
  } else {
    throw new Error('We haven\'t implemented anything but Metamask yet')
  }

  UjoLicensing = new LicensingHelper(provider)

  console.log('accounts', accounts)
  dispatch({
    type: 'WEB3_INIT',
    accounts,
  })
}

export const getTokensForAddressFromContract = (address, contractAddress) => async (dispatch) => {
  const productIds = await UjoLicensing.getOwnedProductIds(address, contractAddress)

  dispatch({
    type: 'GET_PURCHASES',
    address,
    contractAddress,
    productIds,
  })
}

export const buyProduct = (productId, storeId, address, indexOfAccount) => async (dispatch, getState) => {
  const store = getState()
    .store.getIn([ 'stores', storeId ])
    .toJS()

  const licenseId = await UjoLicensing.buyProduct(productId, address, store, indexOfAccount)
  dispatch({
    type: 'PRODUCT_PURCHASE',
    address,
    storeId,
    productId,
  })

  dispatch(getReleaseInfo(productId, storeId, address))
}

export const changeAddress = (newAddress, jwt) => ({
  type: 'CHANGED_ADDRESS',
  newAddress,
  jwt,
})

export const deployStore = (address, indexOfAccount, name) => async (dispatch) => {
  const contractAddresses = await UjoLicensing.deployNewStore(address, indexOfAccount)
  const random = Math.floor(Math.random() * 1000000000)
  contractAddresses.id = random.toString()
  contractAddresses.name = name
  // Update address on server
  let res
  try {
    // should add a new contract to the user
    res = await fetch.deployStore(contractAddresses)
    // res = await axios.post(`/stores`, { contractAddresses });
    dispatch({
      type: 'DEPLOY_STORE',
      address,
      contractAddresses,
    })
  } catch (error) {
    console.log(error)
  }
  console.log(res)
}

export const login = (address, index) => async (dispatch) => {
  try {
    const jwt = window.localStorage.getItem(`jwt-${address}`)
    if (jwt) {
      fetch.setJWT(jwt)
      dispatch(changeAddress(address, jwt))
    } else {
      const resp = await fetch.getLoginChallenge(address)
      const challenge = resp.data.challenge[1].value
      const signature = await UjoLicensing.signData(challenge, index)
      await fetch.login(challenge, signature, address)
    }

    // get contracts
    const res = await fetch.getUserStoreContracts()
    dispatch({
      type: 'AUTH_USER',
      address,
      contractAddresses: res.data,
    });
  } catch (err) {
    console.log('/login error:', err)
  }
}

export const getProductsForContract = (contractAddress, storeId) => async (dispatch) => {
  const { productIds, productData, soldData } = await UjoLicensing.getProductsForContract(contractAddress)

  dispatch({
    type: 'STORE_PRODUCT_INFO',
    productIds,
    productData,
    soldData,
    storeId,
  })
}

export const createProduct = (
  productId,
  price,
  inventory,
  address,
  storeId,
  contractAddress,
  indexOfAccount,
) => async (dispatch) => {
  const product = await UjoLicensing.createProduct(
    productId,
    price,
    inventory,
    address,
    contractAddress,
    indexOfAccount,
  )
  console.log(product)

  dispatch({
    type: 'ADD_NEW_PRODUCT',
    contractAddress,
    storeId,
    productId,
    product,
  })
}

const uploadContent = async (files, storeId, productId) => fetch.uploadContent(files, storeId, productId)

export const createScarceRelease = (
  releaseInfo,
  currentAccount,
  contractAddress,
  storeId,
  indexOfAccount,
) => async (dispatch) => {
  // create random ID for storage purposes
  const random = Math.floor(Math.random() * 1000000000)
  // TODO: add fault tolerance
  // content
  const files = []
  files.push(releaseInfo.releaseImage)
  releaseInfo.tracks.map((track) => {
    files.push(track.file)
  })

  dispatch({ type: 'LOADING' })
  const contentLocations = await uploadContent(files, storeId, random)
  dispatch({ type: 'LOADED' })

  // const trackLocations = await Promise.all(releaseInfo.tracks.map(async track => uploadContent(track.file, storeId, random)));
  console.log('contentLocations', contentLocations)

  releaseInfo.tracks = releaseInfo.tracks.map((track, i) => ({
    name:     track.name,
    duration: track.duration,
    // url: trackLocations[i].original,
    // preview: trackLocations[i].preview,
  }))

  releaseInfo.image = releaseInfo.releaseImage.name

  // metadata
  const res = await axios.post(`/metadata/${storeId}/${random}`, releaseInfo)

  // // check metadata
  // const resp = await axios.get(`/metadata/${contractAddress}/${random}`);
  // console.log('METADATA: ', resp.data);

  // contract
  const product = await UjoLicensing.createProduct(
    random,
    releaseInfo.price,
    releaseInfo.inventory,
    currentAccount,
    contractAddress,
    indexOfAccount,
  )
  console.log(product)

  dispatch({
    type:      'ADD_NEW_PRODUCT',
    contractAddress,
    productId: random,
    product,
    currentAccount,
    storeId,
  })
}

export const getAllProductsInfo = storeId => async (dispatch) => {
  // contract info
  const resp = await axios.get(`/stores?storeID=${storeId}`)
  const storeInfo = resp.data

  // get info from contract
  const { productIds, productData, soldData } = await UjoLicensing.getProductsForContract(storeInfo.LicenseInventory)
  dispatch({
    type: 'STORE_PRODUCT_INFO',
    productIds,
    productData,
    soldData,
    storeId,
  })

  // get metadata info
  productIds.map(async (releaseId) => {
    const res = await axios.get(`/metadata/${storeId}/${releaseId}`)

    // const releaseContractInfo = await UjoLicensing.getProductInfoForContract(storeInfo.LicenseInventory, releaseId);
    // releaseContractInfo.productData.totalSold = releaseContractInfo.soldData;
    dispatch({
      type:             'RELEASE_INFO',
      releaseInfo:      res.data,
      releaseId,
      storeId,
      // releaseContractInfo: releaseContractInfo.productData,
      releaseContracts: resp.data,
    })
  })
}

export const getReleaseInfo = (releaseId, storeId, ethAddress) => async (dispatch) => {
  const res = await axios.get(`/metadata/${storeId}/${releaseId}`)
  const resp = await axios.get(`/stores?storeID=${storeId}`)
  const storeInfo = resp.data

  const releaseContractInfo = await UjoLicensing.getProductInfoForContract(storeInfo, releaseId)

  // check if user owns release
  let owned = false
  // TODO: determine why this call to get ownedIds does not work...
  if (ethAddress) {
    const ownedIds = await UjoLicensing.getOwnedProductIds(ethAddress, storeInfo)
    owned = ownedIds.indexOf(parseInt(releaseId)) > -1
  }
  releaseContractInfo.productData.totalSold = releaseContractInfo.soldData
  dispatch({
    type:                'RELEASE_INFO',
    releaseInfo:         res.data,
    releaseId,
    storeId,
    releaseContractInfo: releaseContractInfo.productData,
    releaseContracts:    resp.data,
    owned,
  })
}

export const downloadProduct = (storeId, releaseId, artistName, releaseName, tracks) => async (dispatch) => {
  dispatch({ type: 'DOWNLOADING' })
  const files = await fetch.downloadFiles(storeId, releaseId, artistName, releaseName, tracks)
  dispatch({ type: 'DOWNLOADED' })
}
