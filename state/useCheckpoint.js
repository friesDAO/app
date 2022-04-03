import { useEffect } from "react"
import ERC20ABI from "../abis/ERC20.json"
import { ethers } from "ethers"
import { useState } from "react"
import { parse } from "../util/number"
import FriesDAOTokenSaleABI from "../abis/FriesDAOTokenSale.json"
import StakingPoolABI from "../abis/FriesDAOStakingPool.json"
import axios from "axios"
import deployments from "../config/deployments.json"
import project from "../config/project.json"

const BN = n => ethers.BigNumber.from(n)

let signedCache = []

function useCheckpoint(account, provider, network, promptConnect) {
	const StakingPool = new ethers.Contract(deployments.stakingPool, StakingPoolABI, provider)
	const Sale = new ethers.Contract(deployments.sale, FriesDAOTokenSaleABI, provider)
	const FRIES = new ethers.Contract(deployments.fries, ERC20ABI, provider)

	async function getSigned(account) {
		if (!signedCache.includes(account)) {
			const result = await axios.get(`/api/checkSignature?address=${account}`).then(result => result.data)
			if (result) signedCache.push(account)
			return result
		}

		return true
	}

	const [state, setState] = useState(0)
	const [totalTokens, setTotalTokens] = useState(BN(0))

	useEffect(() => {
		update()
		const updateInterval = setInterval(update, 5000)

		return () => {
			clearInterval(updateInterval)
		}
	}, [account, network])

	async function update() {
		const [
			_purchased,
			_redeemed,
			_friesStaked,
			_friesBalance,
			_signed
		] = await Promise.all([
			account && network.chainId == project.chainId ? Sale.purchased(account) : BN(0),
			account && network.chainId == project.chainId ? Sale.redeemed(account) : BN(0),
			account && network.chainId == project.chainId ? StakingPool.userInfo(0, account) : [BN(0)],
			account && network.chainId == project.chainId ? FRIES.balanceOf(account) : BN(0),
			account ? getSigned(account) : false
		])

		setTotalTokens(_friesBalance.add(_purchased).sub(_redeemed).add(_friesStaked[0]))

		if (account) {
			if (network.chainId == project.chainId) {
				if (_signed) {
					if (parse(_friesBalance) + parse(_purchased) - parse(_redeemed) + parse(_friesStaked[0]) >= 5000) {
						setState(5)
					} else {
						setState(4)
					}
				} else {
					setState(3)
				}
			} else {
				setState(2)
			}
		} else {
			if (localStorage.WEB3_CONNECT_CACHED_PROVIDER) {
				promptConnect()
			} else {
				setState(1)
			}
		}
	}

	return {
		state,
		totalTokens,
		update
	}
}

export default useCheckpoint