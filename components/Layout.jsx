import { useWallet } from "@gimmixorg/use-wallet"
import { useEffect, useState } from "react";
import project from "../config/project.json"
import classNames from "classnames";
import Link from "next/link"
import { useRouter } from 'next/router';
import Checkpoint from "./Checkpoint.jsx";

const WalletManager = () => {
	const { account, disconnect } = useWallet()
	const [ buttonText, setButtonText ] = useState("Connect Wallet")

	function click() {
		window.open(`${project.explorer}/address/${account}`, '_blank');
	}

	return (
		<>
			<button className={"connect rounded secondary"} onClick={click}>{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect"}</button>

			<button className="disconnect tertiary" onClick={disconnect}><i className="fas fa-sign-out-alt"></i></button>
			<style jsx>{`
				.connect {
					font-size: 1.2em;
					padding: 5px 15px;
					font-weight: 600;
				}

				.disconnect {
					height: 40px;
					width: 40px;
					font-size: 1.2em;
				}

				.disconnect > i {
					color: var(--text);
				}
			`}</style>
		</>
	)
}

const Header = ({ style, theme, setTheme }) => {
	return (
		<>
			<div className="header row center-m" style={style}>
				<div className="header-inner row center-a between">
					<a className="logo-name-container row center-a" href="https://fries.fund/">
						<img className="logo" src={project.logo} />
						<div className="name">friesDAO</div>
					</a>


					<div className="right row center-a">
						<a className="community" href="https://discord.gg/friesdao" target="_blank">community</a>
						<WalletManager />
						<button className="theme tertiary" onClick={() => {setTheme(theme == "light" ? "dark" : "light")}}><i className="fas fa-sun"></i></button>
					</div>
				</div>
			</div>

			<style jsx>{`
				.header {
					width: 100%;
					padding: 8px 20px;
					border-bottom: 1px solid var(--gray);
					box-shadow: 0 0 9px -2px var(--gray);
					background: var(--bg);
				}

				.header-inner {
					max-width: 1000px;
					height: 100%;
					width: 100%;
				}

				.logo-name-container {
					height: 100%;
					gap: 8px;
				}

				.logo {
					height: 100%;
				}

				.name {
					font-size: 1.4em;
					font-weight: 600;
				}

				.right {
					gap: 12px;
				}

				.theme {
					height: 40px;
					width: 40px;
					font-size: 1.2em;
				}
				
				.theme > i {
					color: var(--text);
				}

				.community {
					font-size: 1.2em;
					// text-decoration: underline;
					margin-right: 8px;
					font-weight: 600;
				}

				@media only screen and (max-width: 550px) {
					.name {
						display: none;
					}
					
					.community {
						display: none;
					}
				}
			`}</style>
		</>
	)
}

const Sidebar = ({ style }) => {
	const { pathname } = useRouter()
	const [ sidebarExpanded, setSidebarExpanded ] = useState(false)

	return (
		<>
			<div className="sidebar col between center-a" onMouseEnter={() => setSidebarExpanded(true)} onMouseLeave={() => setSidebarExpanded(false)} style={style}>
				<div className="links-container col center-a">
					<Link href="/">
						<a className={classNames("link", "row", "center-a", {
							active: pathname == "/"
						})}>
							<i className="link-icon fas fa-columns"></i>
							<div className="link-text">home</div>
						</a>
					</Link>

					<Link href="/stake">
						<a className={classNames("link", "row", "center-a", {
							active: pathname == "/stake"
						})}>
							<i className="link-icon fas fa-layer-group"></i>
							<div className="link-text">stake</div>
						</a>
					</Link>

					<Link href="/nft">
						<a className={classNames("link", "row", "center-a", {
							active: pathname == "/nft"
						})}>
							<i className="link-icon fas fa-pizza-slice"></i>
							<div className="link-text">NFT</div>
						</a>
					</Link>

					<Link href="/raise">
						<a className={classNames("link", "row", "center-a", {
							active: pathname == "/raise"
						})}>
							<i className="link-icon fas fa-funnel-dollar"></i>
							<div className="link-text">raise</div>
						</a>
					</Link>
					<Link href="/refund">
						<a className={classNames("link", "row", "center-a", {
							active: pathname == "/refund"
						})}>
							<i className="link-icon fas fa-undo"></i>
							<div className="link-text">refund</div>
						</a>
					</Link>
				</div>

				<div className="links-container col center-a">
					<a className="link row center-a" target="_blank" href="https://github.com/friesDAO/">
						<i className="link-icon fab fa-github"></i>
						<div className="link-text">GitHub</div>
					</a>
					<a className="link row center-a" target="_blank" href="https://friesdao.gitbook.io/friesdao-docs/">
						<i className="link-icon far fa-question-circle"></i>
						<div className="link-text">docs</div>
					</a>
				</div>
			</div>

			<style jsx>{`
				.sidebar {
					border-right: 1px solid var(--gray);
					// box-shadow: 0 0 7px -2px var(--gray);
					height: 100%;
					background-color: var(--bg);
					width: ${sidebarExpanded ? 200 : 75}px;
					transition: 0.25s width;
					z-index: 999;
					padding: 32px 0;
				}

				.links-container {
					gap: 24px;
				}
				
				.link-icon {
					transition: 0.25s color;
					font-size: 1.8em;
				}

				.link-text {
					font-weight: 600;
					transition: 0.25s opacity, 0.25s font-size, 0.25s color;
					opacity: ${sidebarExpanded ? "1" : "0"};
					font-size: ${sidebarExpanded ? "1.2em" : "0"};
				}

				.link {
					transition: 0.25s gap;
					gap: ${sidebarExpanded ? "16px" : "0"};
				}

				.link.active > .link-icon, .link.active > .link-text {
					color: var(--accent);
				}

				.link.disabled > .link-icon, .link.disabled > .link-text {
					color: var(--disabled);	
				}

				.link.disabled {
					pointer-events: none;
				}

				.docs {
					font-size: 2em;
				}

				@media only screen and (max-width: 550px), only screen and (max-height: 410px) {
					.sidebar {
						width: ${sidebarExpanded ? 150 : 50}px;
					}

					.links-container {
						gap: 16px;
					}

					.link-icon {
						font-size: 1.5em;
					}

					.link-text {
						font-size: ${sidebarExpanded ? "1.1em" : "0"};
					}

					.link {
						gap: ${sidebarExpanded ? "10px" : "0"};
					}
				}
			`}</style>
		</>
	)
}

const Layout = ({ children, theme, setTheme }) => {
	const { account } = useWallet();
	const [ checkpointValid, setCheckpointValid ] = useState(false)

	return (
		<>
			<Checkpoint checkpointValid={checkpointValid} setCheckpointValid={setCheckpointValid} theme={theme} />


			{checkpointValid && account ? (
				<div className={classNames("app", "patterned", {
					visible: checkpointValid
				})}>
					<Header style={{ gridArea: "1 / 1 / 2 / 3" }} theme={theme} setTheme={setTheme} />
					<Sidebar style={{ gridArea: "2 / 1 / 3 / 2" }} />
					<div className="main row center-a center-m">
						{children}
					</div>
				</div>
			) : (<></>)}


			<style jsx>{`
				.app {
					display: grid;
					grid-template-rows: 60px 1fr;
					grid-template-columns: 75px 1fr;
					height: 100vh;
					opacity: 0;
					visibility: hidden;
					transition: 0.25s opacity, 0.25s visibility;
				}

				.app.visible {
					opacity: 1;
    				visibility: unset;
    				transition: visibility 0s 0s, opacity 0.25s 0s ;
				}

				.main {
					grid-area: 2 / 2 / 3 / 3;
					overflow: hidden;
				}

				@media only screen and (max-width: 550px) {
					.app {
						grid-template-columns: 50px;
					}
				}
			`}</style>
		</>
	)
}

export default Layout