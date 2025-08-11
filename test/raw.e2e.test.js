const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const { getCalldata } = require(path.join(__dirname, "..", "utils", "loadProofData"));


describe("ZK Proof Verification", function () {
  let verifier;

  before(async function () {
    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("✅ Should verify correct proof", async function () {
    const [a, b, c, input] = await getCalldata(
      path.join(__dirname, "../circuits/build/proof_valid.json"),
      path.join(__dirname, "../circuits/build/publicSignals.json")
    );
    expect(await verifier.verifyProof(a, b, c, input)).to.equal(true);
  });

  it("❌ Should return false for invalid proof", async function () {
    let [a, b, c, input] = await getCalldata(
      path.join(__dirname, "../circuits/build/proof_corrupted.json"),
      path.join(__dirname, "../circuits/build/publicSignals.json")
    );
    
    // Manually corrupt the proof to ensure invalidity (e.g., alter a[0])
    a[0] = a[0] + 1n;  // This small change should make the proof invalid

    expect(await verifier.verifyProof(a, b, c, input)).to.equal(false);
  });
});