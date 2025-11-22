const TOKEN = "0xc2B5cf3312C532B628A2e510f4653B844c1597A9";
const STAKING = "0xa63Dbdd62E482633F8Ee7F240ed311Eb974120D3";

let provider, signer, account;

function toggleMenu() {
  document.getElementById("popupMenu").classList.toggle("active");
}

async function connect(){
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts",[]);
  signer = provider.getSigner();
  account = await signer.getAddress();

  document.getElementById("wallet").textContent =
    account.slice(0,6)+"..."+account.slice(-4);

  refresh();
}

async function refresh(){
  if (!signer) return;

  const token = new ethers.Contract(TOKEN, ["function balanceOf(address) view returns(uint256)"], signer);
  const stake = new ethers.Contract(STAKING, [
    "function users(address) view returns (uint256 amount,uint256 rewardDebt)",
    "function pendingReward(address) view returns (uint256)"
  ], signer);

  const [userData, pending, walletBal] = await Promise.all([
    stake.users(account),
    stake.pendingReward(account),
    token.balanceOf(account)
  ]);

  document.getElementById("stake").textContent = parseFloat(
    ethers.utils.formatUnits(userData.amount,18)
  ).toFixed(4);

  document.getElementById("reward").textContent = parseFloat(
    ethers.utils.formatUnits(pending,18)
  ).toFixed(4);

  document.getElementById("totalGdsx").textContent = parseFloat(
    ethers.utils.formatUnits(walletBal,18)
  ).toFixed(4);
}

async function deposit(){
  const val = document.getElementById("amount").value;
  if (!val) return;
  
  const token = new ethers.Contract(TOKEN, [
    "function approve(address,uint256)",
    "function allowance(address,address) view returns(uint256)"
  ], signer);

  const stake = new ethers.Contract(STAKING, ["function deposit(uint256)"], signer);

  const amt = ethers.utils.parseUnits(val,18);
  const allowance = await token.allowance(account, STAKING);

  if (allowance.lt(amt)) {
    await (await token.approve(STAKING, ethers.constants.MaxUint256)).wait();
  }

  await (await stake.deposit(amt)).wait();
  refresh();
}

async function withdraw(){
  const val = document.getElementById("amount").value;
  if (!val) return;

  const stake = new ethers.Contract(STAKING, ["function withdraw(uint256)"], signer);
  const amt = ethers.utils.parseUnits(val,18);

  await (await stake.withdraw(amt)).wait();
  refresh();
}

async function claim(){
  const stake = new ethers.Contract(STAKING, ["function withdraw(uint256)"], signer);
  await (await stake.withdraw(0)).wait();
  refresh();
}
