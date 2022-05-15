import { ethers } from "ethers"
import { useState, useEffect } from "react"
const BN = n => ethers.BigNumber.from(n)
import ERC20ABI from "../abis/ERC20.json"
import RefundABI from "../abis/FriesDAORefund.json"
import NFTABI from "../abis/FriesDAONFT.json"
import deployments from "../config/deployments.json"
import { makeLeaf, makeTree } from "../util/merkle-refund.js"
import { unparse } from "../util/number"
import refundList from "../config/refund-list.json"

function useRefund(account, signer) {
	const FRIES = new ethers.Contract(deployments.fries, ERC20ABI, signer)
	const Refund = new ethers.Contract(deployments.refund, RefundABI, signer)
	const NFT = new ethers.Contract(deployments.nft, NFTABI, signer)

	const [ friesBalance, setFriesBalance ] = useState(BN(0))
	const [ proof, setProof ] = useState([])
	const [ whitelistLimit, setWhitelistLimit ] = useState(BN(0))
	const [ validNft, setValidNft ] = useState(false)
	const [ refundMax, setRefundMax ] = useState(BN(0))
	const [ refundRatio, setRefundRatio ] = useState(BN(0))

	useEffect(() => {
		update()
		const updateInterval = setInterval(update, 5000)

		return () => {
			clearInterval(updateInterval)
		}
	}, [])

	async function update() {
		const [
			_friesBalance,
			_nftBalance,
			_refunded,
			_refundRatio
		] = await Promise.all([
			FRIES.balanceOf(account),
			NFT.balanceOf(account),
			Refund.refunded(account),
			Refund.getRefundPrice()
		])

		setFriesBalance(_friesBalance)
		const _ownedIds = (await Promise.all([...Array(Number(_nftBalance)).keys()].map(i => NFT.tokenOfOwnerByIndex(account, i)))).map(id => Number(id))

		if (_ownedIds.some(id => id <= 1000)) {
			setRefundMax(_friesBalance)
			setValidNft(true)
			setProof([])
			setWhitelistLimit(BN(0))
		} else if (refundList.map(e => e[0]).includes(ethers.utils.getAddress(account))) {
			const _whitelistLimit = refundList.find(e => e[0] == ethers.utils.getAddress(account))[1]
			const _refundable = unparse(_whitelistLimit).sub(_refunded)
			setRefundMax(_friesBalance.lt(_refundable) ? _friesBalance : _refundable)
			setValidNft(false)
			setWhitelistLimit(unparse(_whitelistLimit, 18))

			const tree = makeTree(refundList)
			const leaf = makeLeaf(account, _whitelistLimit)
			setProof(tree.getHexProof(leaf))
		} else {
			setRefundMax(BN(0))
			setValidNft(false)
			setProof([])
			setWhitelistLimit(BN(0))
		}

		setRefundRatio(_refundRatio)
	}

	async function refund(amount) {
		const tx = Refund.refund(amount, proof, whitelistLimit)
		tx.then(txResponse => txResponse.wait()).then(update)

		return tx
	}

	return {
		friesBalance,
		validNft,
		refundMax,
		refundRatio,
		refund
	}
}

export default useRefund