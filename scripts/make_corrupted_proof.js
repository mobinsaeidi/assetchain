const fs = require("fs");
const path = require("path");

// مسیر فایل‌ها
const proofPath = path.join(__dirname, "../circuits/build/proof_valid.json");
const corruptedPath = path.join(__dirname, "../circuits/build/proof_corrupted.json");

// لود پروف اصلی
const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));

// خراب کردن عدد اول pi_a (مثلاً افزودن 1)
if (proof.pi_a && proof.pi_a.length > 0) {
    proof.pi_a[0] = (BigInt(proof.pi_a[0]) + 1n).toString();
}

// ذخیره پروف خراب
fs.writeFileSync(corruptedPath, JSON.stringify(proof, null, 2));

console.log("✅ corrupted proof saved to:", corruptedPath);
