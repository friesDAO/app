import { ethers } from "ethers"
import { useWallet } from "@gimmixorg/use-wallet"
import { parse, format, toWei, fromWei } from "../../util/number.js"
import { useState, useEffect, useRef } from "react"
import ActionInput from "../../components/ActionInput.jsx"
import classNames from "classnames"
import deployments from "../../config/deployments.json"
import useRefund from "../../state/useRefund.js"

const BN = n => ethers.BigNumber.from(n)

const Stat = ({ title, value, center }) => (
	<>
		<div className="stat-container col">
			<div className="title">{title}</div>
			<div className="stat">{value}</div>
		</div>

		<style jsx>{`
			.stat-container {
				gap: 2px;
				align-items: ${center ? "center" : "flex-start"}
			}

			.title {
				font-weight: 600;
				font-size: 1.5em;
			}

			.stat {
				font-size: 1.3em;
			}
		`}</style>
	</>
)

const Refund = () => {
	const { account, provider } = useWallet()
	const Refunder = useRefund(account, provider.getSigner())
	const [ amount, setAmount ] = useState(BN(0))

	return (
		<>
			<div className="refund-container col center-a">
				<div className="refund-grid">
					<div className="info card refund-card col evenly">
						<div className="card-title">info</div>
						<Stat title="FRIES balance" value={format(parse(Refunder.friesBalance))} />
						<Stat title="refund ratio" value={`$${parse(Refunder.refundRatio, 6)} per FRIES`} />
						<Stat title="eligibility" value={Refunder.validNft ? "contributor NFT" : (Refunder.refundMax.isZero() ? "no" : `${format(parse(Refunder.refundMax))} FRIES`)} />
					</div>

					<div className="refund card refund-card col center-a center-m">
						<div className="card-title">refund</div>
						<div className="warning-title">warning</div>
						<div className="warning">refunding is permanent and depletes the community treasury! once refunded, you won't be able to contribute again at the same rate. there is no expiry to refunding.</div>
						<ActionInput actionName={"refund"} token={{
							name: "FRIES",
							decimals: 18,
							displayDecimals: 2,
							address: deployments.fries
						}} approve={deployments.refund} account={account} signer={provider.getSigner()} action={Refunder.refund} max={Refunder.refundMax} setAmount={setAmount}/>
						<div className="output">you will receive {format(parse(amount) * parse(Refunder.refundRatio, 6), 2)} USDC</div>
					</div>
				</div>
			</div>

			<style jsx>{`
				.refund-container {
					height: 100%;
					width: 100%;
					padding: 40px 20px;
					overflow: auto;
				}

				.refund-grid {
					margin: auto;
					display: grid;
					grid-template-columns: repeat(3, 1fr);
					grid-template-rows: 1fr;
					max-width: 760px;
					width: 100%;
					height: 350px;
					gap: 20px;
				}

				.refund-card {
					position: relative;
					border-top-color: var(--orange);
					border-top-width: 3px;
					padding: 36px 40px 24px 40px;
				}

				.card-title {
					position: absolute;
					font-size: 1.4em;
					top: -1px;
					left: 50%;
					transform: translateX(-50%);
					background-color: var(--accent);
					color: var(--white);
					border: 1px solid var(--accent);
					padding: 0 16px;
					border-radius: 0 0 var(--border-radius) var(--border-radius);
					font-weight: 600;
				}

				.info {
					grid-column: 1 / 2;
				}

				.refund {
					grid-column: 2 / 4;
				}

				.warning-title {
					font-size: 1.5em;
					font-weight: 600;
					color: var(--accent);
				}

				.warning {
					color: var(--accent);
					text-align: center;
					font-size: 1.2em;
					margin-bottom: 20px;
				}

				.output {
					margin-top: 8px;
					font-size: 1.2em;
				}
			`}</style>
		</>
	)
}

export default Refund