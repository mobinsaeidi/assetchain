const fs = require('fs');
const path = require('path');

function getCalldata(proofPath, publicSignalsPath) {
    const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
    const publicSignals = JSON.parse(fs.readFileSync(publicSignalsPath, 'utf8'));

    
    const a = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];

   
    const b = [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])]
    ];

    const c = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

    
    const input = publicSignals.map(x => BigInt(x));

    return [a, b, c, input];
}

module.exports = { getCalldata };
