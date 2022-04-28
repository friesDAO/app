import { ethers } from "ethers"
const keccak256  = require("keccak256")
const { MerkleTree } = require("merkletreejs")

function makeLeaf(address, amount, decimals) {
    const normalizedAddress = ethers.utils.getAddress(address)
    const value = ethers.utils.parseUnits(amount.toString(), decimals).toString()
    const keccak = ethers.utils.solidityKeccak256(
        ["address", "uint256"], 
        [normalizedAddress, value]
    ).slice(2)    
    return Buffer.from(keccak, "hex")
}

function makeTree(whitelist) {
    const leaves =  whitelist.map(([address, amount]) => 
        makeLeaf(address, amount, 18))
    return new MerkleTree(
        leaves,
        keccak256,
        { sort: true }
    )
}

module.exports = {
    makeLeaf, 
    makeTree
}