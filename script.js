const TOKEN = "0xc2B5cf3312C532B628A2e510f4653B844c1597A9";
const STAKING = "0xa63Dbdd62E482633F8Ee7F240ed311Eb974120D3";

let provider, signer, account;

const abiToken = [
  "function approve(address spender,uint256 amount) external returns(bool)",
  "function balanceOf(address) view returns(uint256)",
  "function allowance(address owner,address spender) view returns(uint256)"
];

const abiStaking = [
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function users(address) view returns (uint256 amount,uint256 rewardDebt)",
  "function pendingReward(address userAddr) view returns (uint256)"
];

function $(id){ return document.getElementById(id); }

async function connect(){
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts",[]);
  signer = provider.getSigner();
  account = await signer.getAddress();

  $("wallet").textContent = account.slice(0,6)+"..."+account.slice(-4);
  refresh();
}

async function refresh(){
  const token = new ethers.Contract(TOKEN, abiToken, signer);
  const stake = new ethers.Contract(STAKING, abiStaking, signer);

  const [userData, pending, walletBal] = await Promise.all([
    stake.users(account),
    stake.pendingReward(account),
    token.balanceOf(account)
  ]);

  $("stake").textContent = ethers.utils.formatUnits(userData.amount,18);
  $("reward").textContent = ethers.utils.formatUnits(pending,18);
  $("totalGdsx").textContent = ethers.utils.formatUnits(walletBal,18);
}

async function deposit(){
  const val = $("amount").value;
  if(!val) return;

  const token = new ethers.Contract(TOKEN, abiToken, signer);
  const stake = new ethers.Contract(STAKING, abiStaking, signer);

  const amt = ethers.utils.parseUnits(val,18);

  const allowance = await token.allowance(account, STAKING);
  if(allowance.lt(amt)){
    await (await token.approve(STAKING, ethers.constants.MaxUint256)).wait();
  }

  await (await stake.deposit(amt)).wait();
  refresh();
}

async function withdraw(){
  const val = $("amount").value;
  if(!val) return;

  const stake = new ethers.Contract(STAKING, abiStaking, signer);
  const amt = ethers.utils.parseUnits(val,18);

  await (await stake.withdraw(amt)).wait();
  refresh();
}

async function claim(){
  const stake = new ethers.Contract(STAKING, abiStaking, signer);
  await (await stake.withdraw(0)).wait();
  refresh();
}
