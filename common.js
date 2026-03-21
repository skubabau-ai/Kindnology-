// ============================================
// KINDNOLOGY COMMON FUNCTIONS (Wallet, Contracts)
// ============================================

let currentAccount = null;
let provider = null;
let signer = null;

// Адрес контракта GardenEntrance (заменишь после деплоя)
const GARDEN_CONTRACT = "0x0000000000000000000000000000000000000000";

// Подключение кошелька
async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it to continue.");
        return;
    }
    try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        currentAccount = await signer.getAddress();
        
        // Обновляем UI везде, где есть элементы с data-wallet
        document.querySelectorAll("[data-wallet]").forEach(el => {
            if (el.tagName === 'BUTTON') {
                el.innerText = shortAddress(currentAccount);
            } else {
                el.innerText = currentAccount;
            }
        });
        
        console.log("Wallet connected:", currentAccount);
        return currentAccount;
    } catch (err) {
        console.error("Connection failed:", err);
        alert("Failed to connect wallet.");
    }
}

// Отключение (просто сбрасываем переменные)
function disconnectWallet() {
    currentAccount = null;
    provider = null;
    signer = null;
    document.querySelectorAll("[data-wallet]").forEach(el => {
        if (el.tagName === 'BUTTON') {
            el.innerText = "Connect Wallet";
        } else {
            el.innerText = "";
        }
    });
}

// Укороченный адрес для кнопки
function shortAddress(addr) {
    return addr.slice(0,6) + "..." + addr.slice(-4);
}

// Проверка подключения
function isWalletConnected() {
    return !!currentAccount;
}

// Отправка 15% от опыта в контракт GardenEntrance
async function sendFifteenPercent(experienceEth) {
    if (!isWalletConnected()) {
        alert("Please connect your wallet first.");
        return false;
    }
    if (!experienceEth || experienceEth <= 0) {
        alert("Invalid experience amount.");
        return false;
    }
    const amountToSend = ethers.utils.parseEther((experienceEth * 0.15).toFixed(18));
    
    try {
        // Временно, пока нет контракта, просто показываем информацию
        alert(`You are about to send ${experienceEth * 0.15} ETH to the Garden. (Contract simulation)`);
        console.log("Would send:", amountToSend.toString());
        
        // Когда контракт будет готов, раскомментируй:
        // const contract = new ethers.Contract(GARDEN_CONTRACT, GARDEN_ABI, signer);
        // const tx = await contract.enter({ value: amountToSend });
        // await tx.wait();
        // alert("Transaction confirmed! You are now a gardener.");
        return true;
    } catch (err) {
        console.error("Transaction failed:", err);
        alert("Transaction failed.");
        return false;
    }
}

// Загружаем passport.csv (если нужен на странице)
async function loadPassport() {
    try {
        const response = await fetch('../passports.csv'); // путь относительно корня
        const csvText = await response.text();
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',');
        const passportData = {};
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length < 2) continue;
            const addr = cols[0].trim().toLowerCase();
            const profit = parseFloat(cols[1]);
            if (addr && !isNaN(profit)) {
                passportData[addr] = profit;
            }
        }
        return passportData;
    } catch (e) {
        console.error('Failed to load passports.csv', e);
        return {};
    }
}
