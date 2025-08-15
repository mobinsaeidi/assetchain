const fs = require("fs");
const path = require("path");


const validPath = path.join(__dirname, "circuits", "build", "proof_valid.json");
const corruptedPath = path.join(__dirname, "circuits", "build", "proof_corrupted.json");


let proofData = JSON.parse(fs.readFileSync(validPath));


let proofObj;
if (proofData.proof && proofData.proof.pi_a) {

  proofObj = proofData.proof;
} else if (proofData.pi_a) {

  proofObj = proofData;
} else {
  throw new Error("e1");
}


const original = proofObj.pi_a[0];
proofObj.pi_a[0] = (BigInt(original) + 987654321n).toString();


fs.writeFileSync(corruptedPath, JSON.stringify(proofData, null, 2));

console.log("e2", corruptedPath);
console.log("e3", original);
console.log("e4", proofObj.pi_a[0]);
