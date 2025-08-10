// loadProofData.js (Safe Version with Validation)
const snarkjs = require("snarkjs");

// Helper: نرمال کردن اعداد BigInt و هندل Scientific Notation + Boolean
function normalizeBigIntString(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === "boolean") return value.toString();
  if (typeof value !== "string") value = value.toString();

  if (value.includes("e") || value.includes("E")) {
    return BigInt(value).toString();
  }
  if (/^-?\d+$/.test(value)) {
    return BigInt(value).toString();
  }
  return value;
}

// Helper: بازگشتی آرایه/آبجکت رو به decimal string تبدیل کن
function toDecimalString(data) {
  if (Array.isArray(data)) {
    return data.map(toDecimalString);
  } else if (typeof data === "object" && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, toDecimalString(v)])
    );
  }
  return normalizeBigIntString(data);
}

// Main: گرفتن و آماده کردن calldata برای قرارداد
async function getCalldata(proof, publicSignals) {
  console.log("[DEBUG] Proof object:", proof);
  console.log("[DEBUG] PublicSignals object:", publicSignals);

  // ---- Validation Checks ----
  if (!proof || typeof proof !== "object") {
    throw new Error("❌ Proof داده ندارد یا ساختارش غلط است");
  }
  if (!publicSignals || !Array.isArray(publicSignals)) {
    throw new Error("❌ PublicSignals داده ندارد یا آرایه نیست");
  }

  // ساختار proof با اجزای snarkjs بررسی شود
  const requiredKeys = ["pi_a", "pi_b", "pi_c"];
  for (const key of requiredKeys) {
    if (!proof[key]) {
      throw new Error(`❌ proof.${key} خالی یا undefined است`);
    }
  }

  // ---- Call snarkjs Safely ----
  let calldata;
  try {
    calldata = await snarkjs.groth16.exportSolidityCallData(
      toDecimalString(proof),
      toDecimalString(publicSignals)
    );
  } catch (err) {
    console.error("❌ خطا داخل exportSolidityCallData:", err.message);
    throw err; // Don't hide original snarkjs error
  }

  // ---- Normalize calldata to string[] ----
  if (typeof calldata !== "string") {
    if (Array.isArray(calldata)) {
      calldata = calldata.flat(Infinity).map(String).join(",");
    } else if (typeof calldata === "object" && calldata !== null) {
      calldata = Object.values(calldata).flat(Infinity).map(String).join(",");
    } else {
      calldata = String(calldata);
    }
  }

  return calldata.replace(/["[\]\s]/g, "").split(",");
}

module.exports = { getCalldata };
