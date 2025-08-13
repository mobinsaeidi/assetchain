import { expect } from "chai";
import { ethers } from "hardhat";


async function deployMockVerifier() {
  const Mock = await ethers.getContractFactory("MockVerifier");
  return Mock.deploy();
}

describe("RAW Contract", function () {
  let raw, admin, minter, pauser, user, verifier;

  const validProof = {
    a: [1n, 2n],
    b: [[3n, 4n], [5n, 6n]],
    c: [7n, 8n],
    input: [9n, 10n]
  };

  const invalidProof = {
    a: [0n, 0n],
    b: [[0n, 0n], [0n, 0n]],
    c: [0n, 0n],
    input: [0n, 0n]
  };

  beforeEach(async function () {
    [admin, minter, pauser, user] = await ethers.getSigners();

    // Deploy mock verifier
    verifier = await deployMockVerifier();

    // Deploy RAW
    const RAW = await ethers.getContractFactory("RAW");
    raw = await RAW.deploy(admin.address, verifier.target);

    // رول‌ها
    await raw.connect(admin).grantRole(await raw.MINTER_ROLE(), minter.address);
    await raw.connect(admin).grantRole(await raw.PAUSER_ROLE(), pauser.address);
  });

  it("Should mint when proof is valid", async function () {
    await expect(
      raw.connect(minter).safeMintWithProof(
        user.address,
        "ipfs://token-metadata-1",
        validProof.a,
        validProof.b,
        validProof.c,
        validProof.input
      )
    ).to.emit(raw, "Transfer").withArgs(ethers.ZeroAddress, user.address, 0n);

    const uri = await raw.tokenURI(0n);
    expect(uri).to.equal("ipfs://token-metadata-1");
  });

  it("Should reject mint when proof is invalid", async function () {
    await verifier.setShouldVerify(false);

    await expect(
      raw.connect(minter).safeMintWithProof(
        user.address,
        "ipfs://bad-proof",
        invalidProof.a,
        invalidProof.b,
        invalidProof.c,
        invalidProof.input
      )
    ).to.be.revertedWith("Invalid ZK proof");
  });

  it("Should pause and block minting", async function () {
    await raw.connect(pauser).pause();

    await expect(
      raw.connect(minter).safeMintWithProof(
        user.address,
        "ipfs://while-paused",
        validProof.a,
        validProof.b,
        validProof.c,
        validProof.input
      )
    ).to.be.revertedWithCustomError(raw, "EnforcedPause");
  });

  it("Non-minter cannot mint", async function () {
    await expect(
      raw.connect(user).safeMintWithProof(
        user.address,
        "ipfs://no-role",
        validProof.a,
        validProof.b,
        validProof.c,
        validProof.input
      )
    ).to.be.revertedWith(
      `AccessControl: account ${user.address.toLowerCase()} is missing role ${await raw.MINTER_ROLE()}`
    );
  });
});
