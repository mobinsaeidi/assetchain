const { expect } = require("chai");
const fs = require("fs");
const path = require("path");
const { groth16 } = require("snarkjs");

describe("Groth16Verifier", function () {
    let verifier;

    before(async function () {
        const Verifier = await ethers.getContractFactory("Groth16Verifier");
        verifier = await Verifier.deploy();
        await verifier.waitForDeployment();
        console.log("Verifier deployed at:", verifier.target);
    });

    it("Should verify correct proof", async function () {
        const circuitsPath = path.join(__dirname, "../circuits/build");
        const proof = JSON.parse(fs.readFileSync(path.join(circuitsPath, "proof.json"), "utf8"));
        const publicSignals = JSON.parse(fs.readFileSync(path.join(circuitsPath, "public.json"), "utf8"));

        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

        const argv = calldata
            .replace(/["[\]\s]/g, "")
            .split(",")
            .map(x => BigInt(x));

        const a = [argv[0], argv[1]];
        const b = [
            [argv[2], argv[3]],
            [argv[4], argv[5]]
        ];
        const c = [argv[6], argv[7]];
        const input = argv.slice(8);

        console.log("a:", a);
        console.log("b:", b);
        console.log("c:", c);
        console.log("input:", input);

        const result = await verifier.verifyProof(a, b, c, input);
        console.log("Solidity verifyProof result:", result);

        expect(result).to.be.true;
    });
});
