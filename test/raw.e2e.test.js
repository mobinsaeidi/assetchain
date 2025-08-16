const { expect } = require("chai");
const hardhat = require("hardhat");
const { ethers } = hardhat;

const fs = require("fs");

describe("MyContract", function () {
  // ...
});
const path = require("path");
const fs = require("fs");


function toBigIntSafe(x) {
  if (typeof x === "bigint") return x;
  if (typeof x === "number") return BigInt(Math.trunc(x));
  if (typeof x === "string") {
    if (x.includes("e") || x.includes("E")) {
      return BigInt(Number(x).toFixed(0)); // fallback
    }
    return BigInt(x);
  }
  throw new Error("Unsupported type for BigInt conversion: " + typeof x);
}


function getCalldata(proofPath, publicSignalsPath) {
  const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));
  const publicSignals = JSON.parse(fs.readFileSync(publicSignalsPath, "utf8"));

  const aRaw = proof.pi_a || proof.a;
  const bRaw = proof.pi_b || proof.b;
  const cRaw = proof.pi_c || proof.c;

  const a = [toBigIntSafe(aRaw[0]), toBigIntSafe(aRaw[1])];
  const b = [
    [toBigIntSafe(bRaw[0][1]), toBigIntSafe(bRaw[0][0])], 
    [toBigIntSafe(bRaw[1][1]), toBigIntSafe(bRaw[1][0])]
  ];
  const c = [toBigIntSafe(cRaw[0]), toBigIntSafe(cRaw[1])];
  const input = publicSignals.map((x) => toBigIntSafe(x));

  return [a, b, c, input];
}

describe("ZK Proof Verification", function () {
  let verifier;

  before(async () => {
    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
  });

  it("Should verify correct proof", async function () {
    const [a, b, c, input] = getCalldata(
      path.join(__dirname, "../circuits/build/proof_valid.json"),
      path.join(__dirname, "../circuits/build/publicSignals.json")
    );

    expect(await verifier.verifyProof(a, b, c, input)).to.equal(true);
  });

  it("Should return false for invalid proof", async function () {
    const [a, b, c, input] = getCalldata(
      path.join(__dirname, "../circuits/build/proof_corrupted.json"),
      path.join(__dirname, "../circuits/build/publicSignals.json")
    );

    a[0] = a[0] + 1n; 
    expect(await verifier.verifyProof(a, b, c, input)).to.equal(false);
  });
});
