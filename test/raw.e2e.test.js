const { expect } = require("chai");
const { getCalldata } = require('./utils/loadProofData');

describe("ZK Proof Verification", function () {
  let verifier;

  before(async () => {
    // ساختن corrupted proof قبل از تست‌ها
    require("../scripts/make_corrupted_proof");

    // گرفتن instance از قرارداد Verifier
    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
  });

  it("✅ Should verify correct proof", async function () {
    const proofValid = require("../build/proof_valid.json");
    const publicSignalsValid = require("../build/publicSignals.json");

    const calldata = await getCalldata(proofValid, publicSignalsValid);
    const args = calldata.map(x => BigInt(x).toString());

    expect(await verifier.verifyProof(...args)).to.equal(true);
  });

  it("❌ Should return false for invalid proof", async function () {
    const proofInvalid = require("../build/proof_corrupted.json");
    const publicSignalsInvalid = require("../build/publicSignals.json");

    const calldata = await getCalldata(proofInvalid, publicSignalsInvalid);
    const args = calldata.map(x => BigInt(x).toString());

    expect(await verifier.verifyProof(...args)).to.equal(false);
  });
});
