const { groth16 } = require("snarkjs");

async function getCalldata(proof, publicSignals) {
 
  let rawCalldata = await groth16.exportSolidityCallData(proof, publicSignals);

  
  const calldata = rawCalldata
    .replace(/["[\]\s]/g, "")
    .split(",")
    .map(x => x.toString()); 
  
  const a = [calldata[0], calldata[1]];
  const b = [
    [calldata[2], calldata[3]],
    [calldata[4], calldata[5]]
  ];
  const c = [calldata[6], calldata[7]];
  const input = calldata.slice(8);

  return [a, b, c, input];
}

module.exports = { getCalldata };
