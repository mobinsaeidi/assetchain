const fs = require('fs');
const path = require('path');
const snarkjs = require('snarkjs');
const { loadProofData, getCalldata } = require('./utils/loadProofData');


/**
 * Utility to load proof data from disks.
 * @param {boolean} corrupted - Set true to load proof_corrupted.json instead of valid proof.
 */
function loadProofData(corrupted = false) {
  const proofFileName = corrupted ? 'proof_corrupted.json' : 'proof_valid.json';

  const proofPath = path.join(__dirname, '../circuits/build', proofFileName);
  const publicSignalsPath = path.join(__dirname, '../circuits/build/publicSignals.json');

  const proofFile = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
  const publicSignalsFile = JSON.parse(fs.readFileSync(publicSignalsPath, 'utf8'));

  if (!proofFile || Object.keys(proofFile).length === 0) {
    throw new Error(`${proofFileName} is empty or invalid`);
  }

  if (!publicSignalsFile || publicSignalsFile.length === 0) {
    throw new Error('publicSignals.json is empty or invalid');
  }

  return { proof: proofFile, publicSignals: publicSignalsFile };
}

/**
 * Helper to generate call data directly from loaded proof.
 * @param {boolean} corrupted - Pass true to use corrupted proof.
 */
async function getCalldata(corrupted = false) {
  const { proof, publicSignals } = loadProofData(corrupted);
  return snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
}

module.exports = { loadProofData, getCalldata };


