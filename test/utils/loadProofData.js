const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");
const { BigNumber } = require("@ethersproject/bignumber"); // npm install @ethersproject/bignumber

// --- Helper: تبدیل Scientific Notation به رشته کامل ---
function normalizeBigIntString(value) {
    let str = value.toString();
    if (str.includes("e") || str.includes("E")) {
        const [base, exp] = str.toLowerCase().split("e");
        const decimals = (base.split(".")[1] || "").length;
        const big = BigInt(base.replace(".", "")) * BigInt("1" + "0".repeat(Number(exp) - decimals));
        return big.toString();
    }
    return str;
}

// --- Helper: تبدیل هر مقدار به Decimal String سازگار با Solidity ---
function toDecimalString(value) {
    const normalized = normalizeBigIntString(value);
    return BigNumber.from(normalized).toString();
}

// --- بارگذاری فایل‌های Proof و PublicSignals ---
function loadProofData(corrupted = false) {
    const proofPath = corrupted
        ? path.join(__dirname, "..", "..", "circuits", "build", "proof_corrupted.json")
        : path.join(__dirname, "..", "..", "circuits", "build", "proof_valid.json");

    const publicSignalsPath = path.join(__dirname, "..", "..", "circuits", "build", "publicSignals.json");

    if (!fs.existsSync(proofPath)) throw new Error(`Proof file not found: ${proofPath}`);
    if (!fs.existsSync(publicSignalsPath)) throw new Error(`Public signals file not found: ${publicSignalsPath}`);

    const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));
    const publicSignals = JSON.parse(fs.readFileSync(publicSignalsPath, "utf8"));

    if (!proof || Object.keys(proof).length === 0) throw new Error("Proof JSON is empty");
    if (!publicSignals || publicSignals.length === 0) throw new Error("Public signals JSON is empty");

    return { proof, publicSignals };
}

// --- گرفتن و تبدیل calldata برای قرارداد (با دیباگ) ---
async function getCalldata(corrupted = false) {
    const { proof, publicSignals } = loadProofData(corrupted);

    let rawCalldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);

    // دیباگ: نمایش نوع و مقدار خام خروجی
    console.log("=== DEBUG: rawCalldata ===");
    console.log("Type:", typeof rawCalldata);
    console.dir(rawCalldata, { depth: null });

    let args = [];

    if (typeof rawCalldata === "string") {
        console.log("Format detected: string");
        args = rawCalldata.replace(/["[\]\s]/g, "").split(",");
    } 
    else if (Array.isArray(rawCalldata)) {
        console.log("Format detected: array");
        args = rawCalldata.flat(Infinity);
    } 
    else if (typeof rawCalldata === "object" && rawCalldata !== null) {
        console.log("Format detected: object");
        args = Object.values(rawCalldata).flat(Infinity);
    } 
    else {
        throw new Error(`Unexpected calldata type: ${typeof rawCalldata}`);
    }

    console.log("=== DEBUG: args after processing ===");
    console.log(args);

    return args.map(toDecimalString);
}

module.exports = { getCalldata };
