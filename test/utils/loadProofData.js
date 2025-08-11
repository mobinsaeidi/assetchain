const fs = require('fs');
const path = require('path');

function getCalldata(proofPath, publicSignalsPath) {
    const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
    const publicSignals = JSON.parse(fs.readFileSync(publicSignalsPath, 'utf8'));

   
    const a = proof.pi_a || proof.a;  
    const b = proof.pi_b || proof.b; 
    const c = proof.pi_c || proof.c;  
    const input = publicSignals;

    
    return [
        [BigInt(a[0]), BigInt(a[1])],
        [[BigInt(b[0][0]), BigInt(b[0][1])], [BigInt(b[1][0]), BigInt(b[1][1])]],
        [BigInt(c[0]), BigInt(c[1])],
        input.map(x => BigInt(x))
    ];
}

module.exports = { getCalldata };
