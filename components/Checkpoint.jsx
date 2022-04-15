import { useWallet } from "@gimmixorg/use-wallet"
import { useEffect, useState, useRef } from "react";
import getWeb3ModalConfig from "../util/getWeb3ModalConfig.js"
import project from "../config/project.json"
import classNames from "classnames";
import { parse, format } from "../util/number.js";
import { ethers } from "ethers";
import useCheckpoint from "../state/useCheckpoint.js"

const BN = n => ethers.BigNumber.from(n)


const Checkpoint = ({ checkpointValid, setCheckpointValid, theme }) => {
	const { account, connect, network, provider, web3Modal } = useWallet();
	const checkpoint = useCheckpoint(account, provider, network, promptConnect)
	const [ pdfLoaded, setPdfLoaded ] = useState(false)
	const pdf = useRef(null)
	pdf.current?.addEventListener("load", () => setPdfLoaded(true))
	useEffect(() => {
		const interval = setInterval(() => {
			if (pdfLoaded) {
				clearInterval(interval)
				return
			}
			pdf.current.src = "https://docs.google.com/viewerng/viewer?url=https://fries.fund/friesDAO_Operating_Agreement.pdf&embedded=true"
		}, 2000)

		return () => {
			clearInterval(interval)
		}
	}, [pdfLoaded])

	function promptConnect() {
		connect(getWeb3ModalConfig(theme))
	}

	function switchNetwork() {
		if (web3Modal.cachedProvider === "injected") {
			ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x" + project.chainId }]
            })
		}
	}

	function sign() {
		provider.getSigner().signMessage("I agree to the friesDAO operating agreement").then((signedMessage) => {
			fetch('/api/createSignature', {
                body: JSON.stringify({
                    address: account,
                    signature: signedMessage
                }),
                method: 'POST'
            }).then(() => {
				checkpoint.update()
			})
		})
	}

	useEffect(() => {
		if (checkpoint.state == 5) {
			setCheckpointValid(true)
		} else {
			setCheckpointValid(false)
		}
	}, [checkpoint.state])

	return (
		<>
			<div className={classNames("checkpoint-container", {
				visible: !checkpointValid
			})}>
				<img className={classNames("spinner", {
					visible: checkpoint.state == 0
				})} src="/spinner.svg" />

				<div className={classNames("connect-page", "page", "patterned", "col", "center-m", "center-a", {
					visible: checkpoint.state == 1 || checkpoint.state == 2
				})}>
					<img className="logo" src={project.logo} />

					<div className="title">welcome to friesDAO!</div>

					<button className="connect primary" onClick={checkpoint.state == 1 ? promptConnect : switchNetwork}>{checkpoint.state == 1 ? "connect wallet" : "switch network"}</button>
				</div>

				<div className={classNames("operating-agreement-page", "page", "patterned", "col", "center-m", "center-a", {
					visible: checkpoint.state == 3
				})}>
					<div className="sign-title">sign the friesDAO <a className="underline" href="https://fries.fund/friesDAO_Operating_Agreement.pdf" target="_blank">operating agreement</a></div>
					<div className="pdf card">
						<img className={classNames("spinner", {
							visible: !pdfLoaded
						})} src="./spinner.svg" />
						<iframe ref={pdf} src="https://docs.google.com/viewerng/viewer?url=https://fries.fund/friesDAO_Operating_Agreement.pdf&embedded=true" frameBorder="0" height="100%" width="100%" />
					</div>
					<button className="sign primary" onClick={sign}>accept and sign</button>
				</div>

				<div className={classNames("token-page", "page", "patterned", "col", "center-m", "center-a", {
					visible: checkpoint.state == 4
				})}>
					<div className="token-title">get some FRIES tokens or an NFT to become a member</div>
					<div className="token-desc">you'll need at least 5000 FRIES or a friesDAO NFT for membership</div>
					<div className="token-balance">your FRIES: {format(parse(checkpoint.totalTokens, 18))} FRIES</div>
					<a className="buy button primary" href="https://app.uniswap.org/#/swap?exactField=output&exactAmount=5000&outputCurrency=0xFA57F00D948bb6a28072f5416fCbF7836C3d62dD&chain=mainnet" target="_blank">buy on Uniswap</a>
				</div>
			</div>

			<style jsx>{`
				.checkpoint-container {
					opacity: 0;
					visibility: hidden;
					transition: 0.25s opacity, 0.25s visibility;
					z-index: 999;
					display: none;
				}
				
				.spinner {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					height: 300px;
					opacity: 0;
					visibility: hidden;
					transition: 0.25s opacity, 0.25s visibility;
				}

				.page {
					position: absolute;
					height: 100vh;
					padding: 20px;
					width: 100%;
					transition: 0.25s opacity;
					background-color: var(--bg);
					opacity: 0;
					visibility: hidden;
					transition: 0.25s opacity, 0.25s visibility;
				}

				.connect-page {
					gap: 40px;
				}

				.operating-agreement-page {
					gap: 20px;
				}
				
				.visible {
					opacity: 1;
    				visibility: unset;
    				transition: visibility 0s 0s, opacity 0.25s 0s;
				}

				.checkpoint-container.visible {
					display: block;
				}

				.logo {
					max-width: 400px;
					width: 100%;
				}

				.title {
					font-size: 4em;
					font-weight: 700;
					text-align: center;
				}

				.sign-title, .token-title {
					font-size: 3em;
					font-weight: 700;
					text-align: center;
				}

				.token-page {
					gap: 20px;
				}

				.token-balance {
					font-size: 2em;
					text-align: center;
					font-weight: 600;
				}

				.token-desc {
					font-size: 1.5em;
					text-align: center;
				}

				.connect, .sign, .buy {
					font-size: 2em;
					padding: 8px 20px;
					text-align: center;
				}

				.pdf {
					max-width: 700px;
					width: 95%;
					height: 500px;
				}

				@media only screen and (max-height: 700px) {
					.logo {
						max-width: unset;
						width: unset;
						height: 300px;
					}

					.connect-page {
						gap: 16px;
					}

					.operating-agreement-page {
						font-size: 12px;
					}

					.token-page {
						font-size: 12px;
						gap: 12px;
					}

					.pdf {
						height: 300px;
					}
				}

				@media only screen and (max-height: 500px) {
					.logo {
						max-width: unset;
						width: unset;
						height: 250px;
					}

					.connect-page {
						gap: 8px;
						font-size: 12px;
					}

					.operating-agreement-page {
						gap: 8px;
					}

					.pdf {
						height: 200px;
					}
				}

				@media only screen and (max-width: 700px) {
					.connect-page {
						font-size: 12px;
						gap: 24px;
					}

					.operating-agreement-page {
						font-size: 12px;
					}

					.token-page {
						font-size: 12px;
						gap: 12px;
					}
				}
			`}</style>
		</>
	)
}

export default Checkpoint