const MGX_TOKEN = "0xc2B5cf3312C532B628A2e510f4653B844c1597A9";
const FARM = "0xa63Dbdd62E482633F8Ee7F240ed311Eb974120D3";

let provider, signer, wallet;

const MGX_ABI = [
    "function balanceOf(address) view returns(uint256)",
    "function allowance(address,address) view returns(uint256)",
    "function approve(address,uint256)"
];

const FARM_ABI = [
    "function deposit(uint256)",
    "function withdraw(uint256)",
    "function claim()",
    "function pendingReward(address) view returns(uint256)",
    "function userInfo(address) view returns(uint256 amount, uint256 rewardDebt)"
];


// --------------------
// ENTER MINING DASHBOARD
// --------------------
function openFarm() {
    document.querySelector(".landing").classList.add("hidden");
    document.querySelector("#dashboard").classList.remove("hidden");
    connect();
}


// --------------------
// CONNECT WALLET
// --------------------
async function connect() {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    wallet = await signer.getAddress();

    // Short wallet
    const short = wallet.substring(0, 6) + "..." + wallet.substring(wallet.length - 4);
    document.getElementById("walletBox").innerText = "Wallet: " + short;

    updateData();
}


// --------------------
// UPDATE DASHBOARD DATA
// --------------------
async function updateData() {
    try {
        const mgx = new ethers.Contract(MGX_TOKEN, MGX_ABI, provider);
        const farm = new ethers.Contract(FARM, FARM_ABI, provider);

        // Balance
        const bal = await mgx.balanceOf(wallet);
        document.getElementById("balanceBox").innerText =
            "Balance: " + ethers.utils.formatEther(bal) + " MGX";

        // Staked
        const user = await farm.userInfo(wallet);
        document.getElementById("stakedBox").innerText =
            "Staked: " + ethers.utils.formatEther(user.amount) + " MGX";

        // Reward ( FIXED )
        const rew = await farm.pendingReward(wallet);
        document.getElementById("rewardBox").innerText =
            "Reward: " + ethers.utils.formatEther(rew) + " MGX";

    } catch (err) {
        console.error("Update error:", err);
    }
}


// --------------------
// DEPOSIT (START MINING)
// --------------------
async function deposit() {
    const amount = document.getElementById("amountInput").value;
    if (!amount || Number(amount) <= 0) {
        alert("Enter amount first!");
        return;
    }

    const mgx = new ethers.Contract(MGX_TOKEN, MGX_ABI, signer);
    const farm = new ethers.Contract(FARM, FARM_ABI, signer);

    const value = ethers.utils.parseEther(amount);
    const allow = await mgx.allowance(wallet, FARM);

    if (allow.lt(value)) {
        await mgx.approve(FARM, value);
    }

    await farm.deposit(value);
    updateData();
}


// --------------------
// CLAIM REWARD
// --------------------
async function claim() {
    const farm = new ethers.Contract(FARM, FARM_ABI, signer);
    await farm.claim();
    updateData();
}


// --------------------
// WITHDRAW ALL (STOP MINING)
// --------------------
async function withdraw() {
    const farm = new ethers.Contract(FARM, FARM_ABI, signer);

    const user = await farm.userInfo(wallet);
    const amount = user.amount;

    if (amount.eq(0)) {
        alert("❗ You have no MGX staked.");
        return;
    }

    await farm.withdraw(amount);
    updateData();
}
