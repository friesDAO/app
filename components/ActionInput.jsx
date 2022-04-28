import classNames from "classnames"
import { useState, useRef, useEffect } from "react"
import useApproval from "../state/useApproval"
import { parse, unparse, format, toWei, fromWei } from "../util/number.js"
import { ethers } from "ethers"

const BN = n => ethers.BigNumber.from(n)


const ActionInput = ({actionName, token, max, action, approve, account, signer, setAmount }) => {
	const [ buttonState, setButtonState ] = useState(0)
    const [ buttonText, setButtonText ] = useState(actionName)
	const [ value, setValue ] = useState("")
	const [ lastModificationPercent, setLastModificationPercent ] = useState(0)
	const input = useRef(null)
	const approval = useApproval(account, signer, approve, token.address)

	function buttonAction() {
        const stateActionMapping = {
            0: () => {},
            1: () => {
                approval.approve()
            },
            2: () => {
                action(value)
            }
        }

        stateActionMapping[buttonState]()
    }
		
	function updateButtonState() {
        if (!ethers.BigNumber.isBigNumber(value) || value.isZero() || +value.gt(max)) {
            setButtonState(0)
        } else if (approve && value.gt(approval.allowance)) {
            setButtonState(1)
        } else {
            setButtonState(2)
        }
    }

	useEffect(() => {
		setAmount ? setAmount(value) : null
		console.log(parse(value))
		input.current.value = lastModificationPercent ? parse(value, token.decimals).toFixed(token.displayDecimals) : ethers.BigNumber.isBigNumber(value) ? parse(value, token.decimals) : value
		updateButtonState()
    }, [value, max])

	function inputUpdate() {
        setLastModificationPercent(false)
		if (isNaN(+input.current.value) || input.current.value.includes("e") || input.current.value.slice(-1) == "." || +input.current.value <= 0) {
			setValue(input.current.value)
		} else {
			setValue(BN(unparse(input.current.value, token.decimals)))
		}
    }

	function percentUpdate(percent) {
		setLastModificationPercent(true)
		setValue(max.mul(BN(percent)).div(BN(100)))
	}
	
	function updateButtonText() {
        const stateTextMapping = {
            0: () => actionName,
            1: () => "approve",
            2: () => actionName
        }

        setButtonText(stateTextMapping[buttonState]())
    }

	useEffect(() => {
        updateButtonText()
    }, [buttonState, actionName])

	return (
		<>
			<div className="action-input col">
				<div className="action-input-container row">
					<input ref={input} className="input rounded" placeholder={token.name} onInput={inputUpdate} />
					<button className={classNames("action", "primary", {
						disabled: buttonState === 0
					})} onClick={buttonAction}>{buttonText}</button>
				</div>

				<div className="percents row evenly">
					<button className="percent-button secondary" onClick={() => percentUpdate(25)}>25%</button>
					<button className="percent-button secondary" onClick={() => percentUpdate(50)}>50%</button>
					<button className="percent-button secondary" onClick={() => percentUpdate(55)}>75%</button>
					<button className="percent-button secondary" onClick={() => percentUpdate(100)}>100%</button>
				</div>
			</div>
			
			
			<style jsx>{`
				.input, .action {
					font-size: 1.6em;
					padding: 6px 12px;
				}

				.action-input {
					gap: 8px;
					width: 80%;
				}

				.action-input-container {
					width: 100%;
				}

				.input {
					border-top-right-radius: 0;
					border-bottom-right-radius: 0;
					border: 3px solid var(--accent);
					border-right-width: 0;
					flex: 1;
                    width: 100%;
					outline: none;
					background: inherit;
					color: var(--text);
				}

				.action {
					border-width: 3px;
					border-top-left-radius: 0;
					border-bottom-left-radius: 0;
					border-left-width: 0;
				}

				.disabled {
					border-color: var(--accent) !important;
				}

				.percents {
					width: 100%;
				}

				.percent-button {
					font-size: 0.8em;
					padding: 2px 6px;
				}
			`}</style>
		</>
	)
}

export default ActionInput