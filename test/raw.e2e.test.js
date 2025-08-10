const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const snarkjs = require("snarkjs");

describe("RAW End-to-End ZK Whitelist Tests", function () {
  let deployer, user1, rawContract, verifierContract;

  before(async () => {
    try {
      [deployer, user1] = await ethers.getSigners();

      // Deploy verifier first
      const Groth16Verifier = await ethers.getContractFactory("Groth16Verifier");
      verifierContract = await Groth16Verifier.deploy();
      await verifierContract.waitForDeployment();

      console.log("Verifier deployed at:", verifierContract.target);

      // Deploy RAW with verifier address
      const RAW = await ethers.getContractFactory("RAW");
      rawContract = await RAW.deploy(verifierContract.target);
      await rawContract.waitForDeployment();

      console.log("RAW deployed at:", rawContract.target);

    } catch (err) {
      console.error("Before hook error:", err);
      throw err; // بازپرتاب تا Mocha بفهمه fail شد
    }
  });

  it("should mint token with a valid proof", async () => {
    const proofData = JSON.parse(fs.readFileSync("./proof_valid.json", "utf8"));
    const { proof, publicSignals } = proofData;

    const callData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    const argv = JSON.parse("[" + callData + "]");

    const a = argv[0].map(x => BigInt(x).toString());
    const b = argv[1].map(inner => inner.map(x => BigInt(x).toString()));
    const c = argv[2].map(x => BigInt(x).toString());
    const input = argv[3].map(x => BigInt(x).toString());

    await expect(
      rawContract.connect(deployer).safeMintWithProof(
        user1.address,
        "ipfs://valid-test-token",
        a,
        b,
        c,
        input
      )
    ).to.emit(rawContract, "Transfer");
  });

  it("should revert with 'Invalid ZK proof' for corrupted proof", async () => {
    const proofData = JSON.parse(fs.readFileSync("./proof_corrupted.json", "utf8"));
    const { proof, publicSignals } = proofData;

    const callData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    const argv = JSON.parse("[" + callData + "]");

    const a = argv[0].map(x => BigInt(x).toString());
    const b = argv[1].map(inner => inner.map(x => BigInt(x).toString()));
    const c = argv[2].map(x => BigInt(x).toString());
    const input = argv[3].map(x => BigInt(x).toString());

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

