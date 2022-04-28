import { ethers } from "ethers"
import { useState, useEffect } from "react"
const BN = n => ethers.BigNumber.from(n)
import ERC20ABI from "../abis/ERC20.json"
import NFTABI from "../abis/FriesDAONFT.json"
import deployments from "../config/deployments.json"
import reservedList from "../config/reserved-list.json"
import { parse } from "../util/number.js"
import { makeLeaf, makeTree } from "../util/merkle-nft.js"
import clone from "../util/clone.js"
import useApproval from "./useApproval"
import axios from "axios"

function useNFT(account, signer) {
	const KCHUP = new ethers.Contract(deployments.kchup, ERC20ABI, signer) 
	const NFT = new ethers.Contract(deployments.nft, NFTABI, signer) 
	const standardApproval = useApproval(account, signer, deployments.nft, deployments.kchup)

	const [ kchupBalance, setKchupBalance ] = useState(BN(0))
	const [ standardPriceKCHUP, setStandardPriceKCHUP ] = useState(BN(0))
	const [ limits, setLimits ] = useState([0,0,0])
	const [ reservedNfts, setReservedNfts ] = useState([0,0,0])
	const [ ethBalance, setEthBalance ] = useState(BN(0))
	const [ proof, setProof ] = useState("")
	const [ nftsOwned, setNftsOwned ] = useState({})

	useEffect(() => {
		update()
		const updateInterval = setInterval(update, 5000)

		return () => {
			clearInterval(updateInterval)
		}
	}, [])

	async function update() {
		const [
			_kchupBalance,
			_nftBalance,
			_standardPriceKCHUP,
			_ethBalance,
			_baseURI
		] = await Promise.all([
			KCHUP.balanceOf(account),
			NFT.balanceOf(account),
			NFT.standardPriceKETCHUP(),
			signer.getBalance(),
			NFT.baseURI()
		])
		setKchupBalance(_kchupBalance)
		setEthBalance(_ethBalance)
		setStandardPriceKCHUP(_standardPriceKCHUP)

		const _reservedRaw = reservedList.find(e => e[0] == ethers.utils.getAddress(account))
		if (_reservedRaw) {
			const tree = makeTree(reservedList)
			const leaf = makeLeaf(account, reservedList[0][1])
			setProof(tree.getHexProof(leaf))
			console.log(tree.getHexProof(leaf))
			setLimits(_reservedRaw[1])

			const minted = await Promise.all([
				NFT.minted(account, 0),
				NFT.minted(account, 1),
				NFT.minted(account, 2)
			])
			
			const _reservedNfts = clone(_reservedRaw[1])
			for (let i = 0; i < 3; i++) {
				_reservedNfts[i] -= Number(minted[i])
			}
			setReservedNfts(_reservedNfts)
		} else {
			setReservedNfts([0,0,0])
		}

		const _ownedIds = (await Promise.all([...Array(Number(_nftBalance)).keys()].map(i => NFT.tokenOfOwnerByIndex(account, i)))).map(id => Number(id))
		const _nftsOwned = Object.fromEntries(await Promise.all(_ownedIds.map(id => axios.get(`${_baseURI}${id}`).then(res => ([id, {...res.data, id: id}])))))
		setNftsOwned(_nftsOwned)
	}

	function mintFounders() {
		const tx = NFT.mintFounders(limits, proof)
		tx.then(txResponse => txResponse.wait()).then(update)

		return tx
	}

	function mintGenesis() {
		const tx = NFT.mintGenesis(limits, proof, {value: ethers.utils.parseEther("0.03")})
		tx.then(txResponse => txResponse.wait()).then(update)

		return tx
	}

	function mintLimited() {
		const tx = NFT.mintLimited(limits, proof, {value: ethers.utils.parseEther("0.06")})
		tx.then(txResponse => txResponse.wait()).then(update)

		return tx
	}

	function mintStandard(amount) {
		const tx = NFT.mintStandard(amount)
		tx.then(txResponse => txResponse.wait()).then(update)

		return tx
	}

	return {
		kchupBalance,
		standardPriceKCHUP,
		reservedNfts,
		ethBalance,
		mintFounders,
		mintGenesis,
		mintLimited,
		mintStandard,
		standardApproval,
		nftsOwned
	}
}

export default useNFT