const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");

describe("RAW End-to-End ZK Whitelist Tests", function () {
  let deployer, user1;
  let verifier, rawContract;

  const proofPath = path.join(__dirname, "../circuits/build/proof.json");
  const publicPath = path.join(__dirname, "../circuits/build/public.json");

  beforeEach(async function () {
    [deployer, user1] = await ethers.getSigners();

    // Deploy verifier
    const Verifier = await ethers.getContractFactory("Groth16Verifier", deployer);
    verifier = await Verifier.deploy();
    await verifier.waitForDeployment();

    // Deploy RAW contract
    const RAW = await ethers.getContractFactory("RAW", deployer);
    rawContract = await RAW.deploy(
      deployer.address,   // admin
      verifier.target     // verifier address
    );
    await rawContract.waitForDeployment();

    // Give deployer MINTER role
    await rawContract.grantRole(
      await rawContract.MINTER_ROLE(),
      deployer.address
    );
  });

  /** Helper: convert callData (string) to decimal string arrays for uint256 */
  function parseCallData(callData) {
    return callData
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map(x => BigInt(x).toString()); // → decimal string conversion
  }

  it("should mint token with a valid proof", async function () {
    const rawProofData = JSON.parse(fs.readFileSync(proofPath, "utf8"));
    const proof = rawProofData.proof || rawProofData;
    const publicSignals = JSON.parse(fs.readFileSync(publicPath, "utf8"));

    const callData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    const argv = parseCallData(callData);

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const input = argv.slice(8);

    const tokenUri = "ipfs://my-test-token";

    await expect(
      rawContract.connect(deployer).safeMintWithProof(
        user1.address,
        tokenUri, // ← ضروری
        a,
        b,
        c,
        input
      )
    )
      .to.emit(rawContract, "Transfer")
      .withArgs(ethers.ZeroAddress, user1.address, 1n);
  });

  it("should revert with 'Invalid ZK proof' for corrupted proof", async function () {
    const rawProofData = JSON.parse(fs.readFileSync(proofPath, "utf8"));
    const proof = rawProofData.proof || rawProofData;
    const publicSignals = JSON.parse(fs.readFileSync(publicPath, "utf8"));

    // Corrupt proof data
    publicSignals[0] = (BigInt(publicSignals[0]) + 1n).toString();

    const callData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    const argv = parseCallData(callData);

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const input = argv.slice(8);

    const tokenUri = "ipfs://broken-token";

    await expect(
      rawContract.connect(deployer).safeMintWithProof(
        user1.address,
        tokenUri, // ← ضروری
        a,
        b,
        c,
        input
      )
    ).to.be.revertedWith("Invalid ZK proof");
  });
});

