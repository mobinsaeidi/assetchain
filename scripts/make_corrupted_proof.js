const fs = require("fs");
const path = require("path");


const proofPath = path.join(__dirname, "../circuits/build/proof_valid.json");
const corruptedPath = path.join(__dirname, "../circuits/build/proof_corrupted.json");


const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));


if (proof.pi_a && proof.pi_a.length > 0) {
    proof.pi_a[0] = (BigInt(proof.pi_a[0]) + 1n).toString();
}

fs.writeFileSync(corruptedPath, JSON.stringify(proof, null, 2));

console.log("✅ corrupted proof saved to:", corruptedPath);
