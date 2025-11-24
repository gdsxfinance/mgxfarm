/* ======== MGX SMART CONTRACT SYSTEM ============ */
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

/* ===== ENTER DASHBOARD ===== */
function openFarm() {
    document.querySelector(".landing").classList.add("hidden");
    document.querySelector("#dashboard").classList.remove("hidden");
    connect();
}

/* ===== CONNECT WALLET ===== */
async function connect() {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    wallet = await signer.getAddress();

    const short = wallet.slice(0,6) + "..." + wallet.slice(-4);
    document.getElementById("walletBox").innerText = "Wallet: " + short;

    updateData();
}

/* ===== UPDATE DATA ===== */
async function updateData() {
    const mgx = new ethers.Contract(MGX_TOKEN, MGX_ABI, provider);
    const farm = new ethers.Contract(FARM, FARM_ABI, provider);

    document.getElementById("balanceBox").innerText =
        "Balance: " + ethers.utils.formatEther(await mgx.balanceOf(wallet));

    const u = await farm.userInfo(wallet);
    document.getElementById("stakedBox").innerText =
        "Staked: " + ethers.utils.formatEther(u.amount);

    document.getElementById("rewardBox").innerText =
        "Reward: " + ethers.utils.formatEther(await farm.pendingReward(wallet));
}

/* ===== DEPOSIT ===== */
async function deposit() {
    const value = document.getElementById("amountInput").value;
    if (!value) return alert("Enter amount!");

    const mgx = new ethers.Contract(MGX_TOKEN, MGX_ABI, signer);
    const farm = new ethers.Contract(FARM, FARM_ABI, signer);

    const amount = ethers.utils.parseEther(value);
    const allow = await mgx.allowance(wallet, FARM);

    if (allow.lt(amount)) await mgx.approve(FARM, amount);
    await farm.deposit(amount);

    updateData();
}

/* ===== CLAIM ===== */
async function claim() {
    await new ethers.Contract(FARM, FARM_ABI, signer).claim();
    updateData();
}

/* ===== WITHDRAW ===== */
async function withdraw() {
    const farm = new ethers.Contract(FARM, FARM_ABI, signer);
    const user = await farm.userInfo(wallet);
    if (user.amount.eq(0)) return alert("No MGX staked");
    await farm.withdraw(user.amount);
    updateData();
}

/* ===== MENU ===== */
document.querySelector(".menu-btn").onclick = () => {
    document.getElementById("dropdownMenu").classList.toggle("hidden");
};

/* ===== BACK BUTTON ===== */
document.querySelector(".back-btn").onclick = () => {
    document.getElementById("dashboard").classList.add("hidden");
    document.querySelector(".landing").classList.remove("hidden");
};

/* ===== STARFIELD BACKGROUND ===== */
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const stars = Array.from({length: 200}, () => ({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    z: Math.random()*2 + 0.2
}));

function animateStars() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    stars.forEach(s=>{
        ctx.fillStyle="white";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.z, 0, Math.PI*2);
        ctx.fill();

        s.y += s.z;
        if(s.y>canvas.height){
            s.y=0;
            s.x=Math.random()*canvas.width;
        }
    });

    requestAnimationFrame(animateStars);
}

animateStars();
<script>
function goFarmV2() {
    window.location.href = "farmv2.html";   // ชื่อไฟล์หน้า MGX FARM V2
}
</script>
