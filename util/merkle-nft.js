import { ethers } from "ethers"
const keccak256  = require("keccak256")
const { MerkleTree } = require("merkletreejs")

function makeLeaf(address, amounts) {
    const normalizedAddress = ethers.utils.getAddress(address)
    const keccak = ethers.utils.solidityKeccak256(
        ["address", "uint256[3]"], 
        [normalizedAddress, amounts]
    ).slice(2)
    return Buffer.from(keccak, "hex")
}

function makeTree(whitelist) {
    const leaves =  whitelist.map(([address, amounts]) => 
        makeLeaf(address, amounts))
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