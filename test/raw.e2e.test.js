const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");

describe("RAW End-to-End ZK Whitelist Tests", function () {
  let deployer, user1, rawContract, verifierContract;

  // ======== Deploy Contracts ========
  before(async () => {
    [deployer, user1] = await ethers.getSigners();

    // Deploy Groth16Verifier
    const Groth16Verifier = await ethers.getContractFactory("Groth16Verifier");
    verifierContract = await Groth16Verifier.deploy();
    await verifierContract.waitForDeployment();
    console.log("Verifier deployed at:", verifierContract.target);

    // Deploy RAW
    const RAW = await ethers.getContractFactory("RAW");
    rawContract = await RAW.deploy(
      deployer.address,         // admin
      verifierContract.target   // verifierAddress
    );
    await rawContract.waitForDeployment();
    console.log("RAW deployed at:", rawContract.target);
  });

  // ======== Helper: Load Proof from circuits/build ========
  function loadProofData(fileName) {
    const proofPath = path.join(__dirname, "../circuits/build", fileName);
    const proofData = JSON.parse(fs.readFileSync(proofPath, "utf8"));

    return snarkjs.groth16
      .exportSolidityCallData(proofData.proof, proofData.publicSignals)
      .then(callData => {
        const argv = JSON.parse("[" + callData + "]");
        const a = argv[0].map(x => BigInt(x).toString());
        const b = argv[1].map(inner => inner.map(x => BigInt(x).toString()));
        const c = argv[2].map(x => BigInt(x).toString());
        const input = argv[3].map(x => BigInt(x).toString());
        return { a, b, c, input };
      });
  }

  // ======== Valid Proof Test ========
  it("should mint token with a valid proof", async () => {
    const { a, b, c, input } = await loadProofData("proof_valid.json");

    await expect(
      rawContract.connect(deployer).safeMintWithProof(
        user1.address,
        "ipfs://valid-test-token",
        a,
        b,
        c,
        input
      )
    ).to.emit(rawContract, "Transfer").withArgs(
      ethers.ZeroAddress,
      user1.address,
      0 // tokenId
    );
  });

  // ======== Invalid Proof Test ========
  it("should revert with 'Invalid ZK proof' for corrupted proof", async () => {
    const { a, b, c, input } = await loadProofData("proof_corrupted.json");

    await expect(
      rawContract.connect(deployer).safeMintWithProof(
        user1.address,
        "ipfs://broken-test-token",
        a,
        b,
        c,
        input
      )
    ).to.be.revertedWith("Invalid ZK proof");
  });
});

