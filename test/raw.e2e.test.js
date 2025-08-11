const { expect } = require("chai");
const { getCalldata } = require("./utils/loadProofData");

describe("ZK Proof Verification", function () {
  let verifier;

  before(async () => {
    require("../scripts/make_corrupted_proof");
    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
  });

  it("✅ Should verify correct proof", async function () {
    const proofValid = require("../circuits/build/proof_valid.json");
    const publicSignalsValid = require("../circuits/build/publicSignals.json");

    const [a, b, c, input] = await getCalldata(proofValid, publicSignalsValid);
    expect(await verifier.verifyProof(a, b, c, input)).to.equal(true);
  });

  it("❌ Should return false for invalid proof", async function () {
    const proofInvalid = require("../circuits/build/proof_corrupted.json");
    const publicSignalsInvalid = require("../circuits/build/publicSignals.json");

    const [a, b, c, input] = await getCalldata(proofInvalid, publicSignalsInvalid);
    expect(await verifier.verifyProof(a, b, c, input)).to.equal(false);
  });
});
