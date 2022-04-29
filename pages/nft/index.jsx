import { ethers } from "ethers"
import useRaise from "../../state/useRaise"
import { useWallet } from "@gimmixorg/use-wallet"
import { useState, useEffect, useRef } from "react"
import { parse, format, toWei, fromWei } from "../../util/number.js"
import project from "../../config/project.json"
import deployments from "../../config/deployments.json"
import classNames from "classnames"
import useNFT from "../../state/useNFT"
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
				font-size: 1.6em;
			}

			.stat {
				font-size: 1.4em;
			}
		`}</style>
	</>
)

const NFTPage = () => {
	const { provider, account } = useWallet()
	const NFT = useNFT(account, provider.getSigner())
	const [ standardMintAmount, setStandardMintAmount ] = useState(0)
	const [ selectedNFT, setSelectedNFT ] = useState(null)

	useEffect(() => {
		setSelectedNFT(Object.keys(NFT.nftsOwned).length ? NFT.nftsOwned[Object.keys(NFT.nftsOwned)[0]].id : null)
	}, [JSON.stringify(NFT.nftsOwned)])

	return (
		<>
			<div className="nft-container col center-a">
				<div className="nft-grid">
					<div className="image-container">
						<img className="image card" src="./placeholder.png"></img>
						<div className={classNames("not-selected", {
							hidden: selectedNFT
						})}>select or mint an NFT</div>	
					</div>
					
					<div className="info col center-m">
						<div className="traits card nft-card col between">
							<div className="card-title">{selectedNFT ? `${NFT.nftsOwned[selectedNFT].attributes.find(a => a.trait_type == "Edition").value.toLowerCase()} #${selectedNFT}` : "order"}</div>
							<Stat title="main dish" value="???" center />
							<Stat title="side dish" value="???" center />
							<Stat title="fries style" value="???" center />
							<Stat title="sauce" value="???" center />
							<Stat title="dessert" value="???" center />
							<Stat title="drink" value="???" center />
						</div>

						<div className="opensea-link card row center-m center-a">
							<a href={`https://opensea.io/assets/0x8e30f1673517445708abe259337b782d09477b06/${selectedNFT}`} target="_blank" className="link-text">opensea</a>
							<i className="fas fa-external-link-alt link-icon"></i>
						</div>
					</div>

					<div className="nft-select card nft-card col center-a">
						{	 
							Object.values(NFT.nftsOwned).map(nft => (
								<>
									<div className="nft-preview col center-a rounded" onClick={() => setSelectedNFT(nft.id)}>
										<img src={nft.image} className="nft-thumbnail"/>
										<div className={classNames("preview-id", {
											disabled: selectedNFT !== nft.id
										})}>{nft.id}</div>
									</div>
								</>
							))
						}
					</div>
					
					<div className="mint card nft-card">
						<div className="card-title">mint</div>
						<div className="mint-grid">
							<div className="mint-reserved col">
								<div className="reserved-title">reserved NFTs</div>
								<div className="reserved-group row between">
									<div className="reserved-group-name row center-a">founders edition <div className={classNames("reserved-amount", "rounded", {
										disabled: NFT.reservedNfts[0] == 0
									})}>{NFT.reservedNfts[0]}</div></div>
									<button className={classNames("mint-button", "button", "primary", {
										disabled: NFT.reservedNfts[0] == 0
									})} onClick={NFT.mintFounders}>mint</button>
								</div>

								<div className="reserved-group row between">
									<div className="reserved-group-name row center-a">genesis edition <div className={classNames("reserved-amount", "rounded", {
										disabled: NFT.reservedNfts[1] == 0
									})}>{NFT.reservedNfts[1]}</div></div>
									<button className={classNames("mint-button", "button", "primary", {
										disabled: NFT.reservedNfts[1] == 0 || parse(NFT.ethBalance) < 0.03
									})} onClick={NFT.mintGenesis}>mint{NFT.reservedNfts[1] != 0 ? " - 0.03 eth" : ""}</button>
								</div>

								<div className="reserved-group row between">
									<div className="reserved-group-name row center-a">limited edition <div className={classNames("reserved-amount", "rounded", {
										disabled: NFT.reservedNfts[2] == 0
									})}>{NFT.reservedNfts[2]}</div></div>
									<button className={classNames("mint-button", "button", "primary", {
										disabled: NFT.reservedNfts[2] == 0 || parse(NFT.ethBalance) < 0.06
									})} onClick={NFT.mintLimited}>mint{NFT.reservedNfts[2] != 0 ? " - 0.06 eth" : ""}</button>
								</div>
							</div>

							<div className="mint-standard col center-a">
								<div className="standard-title">standard NFTs</div>
								<div className="standard-price">standard NFTs cost {format(parse(NFT.standardPriceKCHUP), 0)} KCHUP</div>
								<div className="kchup-balance">you have {format(parse(NFT.kchupBalance))} KCHUP</div>
								<div className="standard-mint-action-container row evenly">
									<div className="standard-amount-container row">
										<i className={classNames("fas", "fa-minus", "standard-amount-control", "button", "primary", {
											disabled: standardMintAmount == 0
										})} onClick={() => setStandardMintAmount(standardMintAmount - 1)}></i>
										<div className="standard-amount">{standardMintAmount}</div>
										<i className={classNames("fas", "fa-plus", "standard-amount-control","button", "primary", {
											disabled: standardMintAmount + 1 > (parse(NFT.kchupBalance) / parse(NFT.standardPriceKCHUP))
										})} onClick={() => setStandardMintAmount(standardMintAmount + 1)}></i>
									</div>
									<button className={classNames("mint-button", "button", "primary", {
										disabled: standardMintAmount > (parse(NFT.kchupBalance) / parse(NFT.standardPriceKCHUP)) || standardMintAmount == 0
									})} onClick={NFT.standardPriceKCHUP.mul(BN(standardMintAmount)).gt(NFT.standardApproval.allowance) ? () => NFT.standardApproval.approve() : () => NFT.mintStandard(standardMintAmount)}>{NFT.standardPriceKCHUP.mul(BN(standardMintAmount)).gt(NFT.standardApproval.allowance) ? "approve" : "mint"}</button>
								</div>
								<div className="standard-mint-cost">{format(parse(NFT.standardPriceKCHUP) * standardMintAmount, 0)} KCHUP</div>
							</div>
						</div>
					</div>
				</div>

			</div>
			<style jsx>{`
				.nft-container {
					height: 100%;
					width: 100%;
					padding: 80px 40px;
					overflow: auto;
				}

				.nft-grid {
					margin: auto;
					display: grid;
					grid-template-columns: 13fr 5fr 2fr;
					max-width: 840px;
					width: 100%;
					gap: 20px;
				}

				.nft-card {
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
					white-space: nowrap;
					transform: translateX(-50%);
					background-color: var(--accent);
					color: var(--white);
					border: 1px solid var(--accent);
					padding: 0 16px;
					border-radius: 0 0 var(--border-radius) var(--border-radius);
					font-weight: 600;
				}

				.image {
					width: 100%;
					transition: 0.25s opacity;
					opacity: ${selectedNFT ? 1 : 0.4};
					// grid-area: 1 / 1 / 3 / 2;
				}

				.traits {
					flex: 1;
					padding: 40px 40px 20px 40px;
				}

				.info {
					gap: 12px;
				}

				.mint {
					grid-column: 1 / 4;
					padding: 16px 40px 24px 40px;
				}

				.opensea-link {
					padding: 5px;
					gap: 10px;
					border-bottom-color: var(--orange);
					border-bottom-width: 3px;
				}

				.link-text {
					font-size: 1.3em;
					font-weight: bold;
				}
				
				.link-icon {
					font-size: 1.1em;
					color: var(--accent);
				}

				.mint-grid {
					display: grid;
					grid-template-columns: 1fr 1fr;
				}

				.mint-reserved {
					gap: 4px;
					padding-right: 20px;
					border-right: 1px solid var(--accent);
				}

				.mint-standard {
					gap: 6px;
					padding-left: 20px;
					border-left: 1px solid var(--accent);
				}

				.reserved-group-name {
					gap: 5px;
					font-size: 1.3em;
				}

				.reserved-amount {
					color: white;
					background-color: var(--accent);
					padding: 0px 5px;
					font-size: 0.9em;
				}

				.disabled {
					background-color: var(--disabled) !important;
				}

				.mint-button {
					padding: 2px 8px;
					font-size: 1.1em;
				}

				.reserved-title, .standard-title {
					font-size: 1.4em;
					font-weight: bold;
					align-self: center;
					margin-bottom: 4px;
				}

				.standard-price {
					font-size: 1em;
					line-height: 1em;
					text-align: center;
				}

				.kchup-balance {
					font-size: 1.15em;
					line-height: 1em;
					text-align: center;
				}

				.standard-amount-container {
					gap: 4px;
				}

				.standard-amount-control {
					padding: 2px 4px;
				}

				.standard-amount {
					border: none;
					border-bottom: 2px solid var(--accent);
					width: 3em;
					outline: none;
					text-align: center;
					font-size: 1.2em;
					border-radius: 6px;
				}

				.standard-mint-action-container {
					width: 100%;
				}

				.standard-mint-cost {
					font-size: 1em;
				}

				.nft-select {
					padding: 12px 2px 12px 12px;
					overflow: scroll;
					height: 519px;
					gap: 8px;
					
				}

				.nft-preview {
					width: 100%;
					overflow: hidden;
					cursor: pointer;
					flex-shrink: 0;
				}

				.nft-thumbnail {
					width: 100%;
					border-radius: var(--border-radius) var(--border-radius) 0 0;
				}

				.preview-id {
					background-color: var(--accent);
					color: var(--white);
					width: 100%;
					text-align: center;
					font-size: 0.9em;
					transition: 0.25s background-color;
				}

				.image-container {
					position: relative;
					background-color: var(--bg);
				}

				.not-selected {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					text-align: center;
					font-size: 3em;
					font-weight: 600;
					width: 100%;
					padding: 10px;
				}

				.not-selected.hidden {
					display: none;
				}

				@media only screen and (max-width: 1000px) {
					.image-container {
						grid-area: 1 / 1 / 2 / 3;
					}

					.nft-select {
						grid-area: 1 / 3 / 2 / 4;
						height: calc(calc(100vw - 183px) * 18 / 20);
					}

					.info {
						grid-column: 1 / 4;
					}

					.nft-container {
						font-size: 80%;
					}
				}

				@media only screen and (max-width: 850px) {
					.nft-grid {
						grid-template-columns: 13fr 4fr 3fr
					}
					
					.nft-select {
						height: calc(calc(100vw - 183px) * 17 / 20);
					}

					.mint-grid {
						grid-template-columns: none;
						grid-template-rows: 1fr 1fr;
					}

					.mint {
						padding: 36px 40px 24px 40px;
					}

					.mint-reserved {
						padding-right: 0px;
						padding-bottom: 20px;
						border-right: none;
						border-bottom: 1px solid var(--accent);
					}

					.mint-standard {
						padding-left: 0px;
						padding-top: 20px;
						border-left: none;
						border-top: 1px solid var(--accent);
					}
				}

				@media only screen and (max-width: 650px) {
					.nft-select {
						padding: 8px 8px 8px 8px;
						overflow: auto;
					}
				}

				@media only screen and (max-width: 550px) {
					.image-container {
						grid-column: 1 / 4;
					}
					
					.nft-select {
						height: 100px;
						grid-area: 2 / 1 / 3 / 4;
						flex-direction: row;
					}

					.nft-preview {
						width: unset;
						height: 100%;
					}

					.nft-thumbnail {
						width: unset;
						height: calc(100% - 16px);
					}
				}

				@media only screen and (max-width: 1000px) {
					.nft-container {
						font-size: 75%;
					}
				}
			`}</style>
		</>
	)
}

export default NFTPage