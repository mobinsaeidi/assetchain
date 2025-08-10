const fs = require('fs');
const path = require('path');
const snarkjs = require('snarkjs');

function loadProofData() {
  const proofPath = path.join(__dirname, '../circuits/build/proof_valid.json');
  const publicSignalsPath = path.join(__dirname, '../circuits/build/publicSignals.json');

  const proofFile = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
  const publicSignalsFile = JSON.parse(fs.readFileSync(publicSignalsPath, 'utf8'));

  if (!proofFile || Object.keys(proofFile).length === 0) {
    throw new Error('proof_valid.json is empty or invalid');
  }

  if (!publicSignalsFile || publicSignalsFile.length === 0) {
    throw new Error('publicSignals.json is empty or invalid');
  }

 
  return { proof: proofFile, publicSignals: publicSignalsFile };
}


