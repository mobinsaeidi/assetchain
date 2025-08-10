const fs = require('fs');
const path = require('path');

const proofValidPath = path.join(__dirname, '../circuits/build/proof_valid.json');
const proofCorruptedPath = path.join(__dirname, '../circuits/build/proof_corrupted.json');

function makeCorruptedProof() {
  
  const proof = JSON.parse(fs.readFileSync(proofValidPath, 'utf8'));

 
  if (proof.pi_a && proof.pi_a[0]) {
    proof.pi_a[0] = (parseInt(proof.pi_a[0]) + 1).toString(); 
  } else {
    throw new Error("pi_a not found in proof_valid.json");
  }

 
  fs.writeFileSync(proofCorruptedPath, JSON.stringify(proof, null, 2));
  console.log(`Corrupted proof saved to: ${proofCorruptedPath}`);
}

makeCorruptedProof();
