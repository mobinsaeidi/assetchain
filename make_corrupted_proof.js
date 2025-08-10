const fs = require("fs");
const path = require("path");

// مسیر پروف اصلی و خراب
const validPath = path.join(__dirname, "circuits", "build", "proof_valid.json");
const corruptedPath = path.join(__dirname, "circuits", "build", "proof_corrupted.json");

// خواندن JSON
let proofData = JSON.parse(fs.readFileSync(validPath));

// گرفتن ریفرنس به محل pi_a
let proofObj;
if (proofData.proof && proofData.proof.pi_a) {
  // ساختار دارای آبجکت proof
  proofObj = proofData.proof;
} else if (proofData.pi_a) {
  // ساختار ساده
  proofObj = proofData;
} else {
  throw new Error("ساختار proof_valid.json ناشناخته است - pi_a پیدا نشد!");
}

// خراب‌کردن اولین المان pi_a
const original = proofObj.pi_a[0];
proofObj.pi_a[0] = (BigInt(original) + 987654321n).toString();

// ذخیره پروف خراب
fs.writeFileSync(corruptedPath, JSON.stringify(proofData, null, 2));

console.log("✅ پروف خراب ساخته شد:", corruptedPath);
console.log("ℹ️ مقدار اصلی:", original);
console.log("ℹ️ مقدار جدید:", proofObj.pi_a[0]);
