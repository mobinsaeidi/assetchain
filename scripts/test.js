// scripts/testActions.js
const { ethers } = require("hardhat");

async function main() {
    const [deployer, user1] = await ethers.getSigners();

    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

    // Deploying contract
    const RAW = await ethers.getContractFactory("RAW");
    const raw = await RAW.deploy(deployer.address); // admin = deployer
    await raw.deployed();
    console.log("RAW contract deployed to:", raw.address);

    // Mint first token
    console.log("
--- Minting Token #0 ---");
    await raw.safeMint(user1.address, "https://example.com/metadata/0.json");
    console.log("Token #0 Minted to:", user1.address);

    // Read tokenURI
    let uri0 = await raw.tokenURI(0);
    console.log("Token #0 URI:", uri0);

    // Pause contract
    console.log("
Pausing contract...");
    await raw.pause();
    console.log("Contract paused.");

    // Try mint while paused
    try {
        console.log("Attempting mint while paused (should fail)...");
        await raw.safeMint(user1.address, "https://example.com/metadata/1.json");
    } catch (err) {
        console.log("Mint failed as expected:", err.message);
    }

    // Unpause contract
    console.log("
Unpausing contract...");
    await raw.unpause();
    console.log("Contract unpaused.");

    // Mint after unpause
    console.log("
--- Minting Token #1 ---");
    await raw.safeMint(user1.address, "https://example.com/metadata/1.json");
    console.log("Token #1 Minted to:", user1.address);

    let uri1 = await raw.tokenURI(1);
    console.log("Token #1 URI:", uri1);

    console.log("
✅ All actions completed successfully.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
