// common.js — общий код для Kindnology портала

// ------------------- Web3 / MetaMask -------------------
let currentLang = 'en';

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            return accounts[0];
        } catch (error) {
            console.error('User denied account access');
            return null;
        }
    } else {
        alert('MetaMask is not installed. Please install it to interact with the Garden.');
        return null;
    }
}

// ------------------- Загрузка passports.csv -------------------
let passportsMap = null;

async function loadPassports() {
    if (passportsMap) return passportsMap;
    try {
        const response = await fetch('/passports.csv');
        if (!response.ok) throw new Error('CSV not found');
        const text = await response.text();
        const lines = text.split('\n').filter(l => l.trim());
        const map = new Map();
        let totalProfitSum = 0;
        let uniqueCount = 0;
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts.length >= 2) {
                const addr = parts[0].toLowerCase();
                const profit = parseFloat(parts[1]);
                if (!isNaN(profit)) {
                    map.set(addr, profit);
                    totalProfitSum += profit;
                    uniqueCount++;
                }
            }
        }
        // если есть элементы статистики на странице — обновляем их
        if (document.getElementById('invitedCount')) {
            document.getElementById('invitedCount').innerText = uniqueCount.toLocaleString();
            document.getElementById('totalExperience').innerText = totalProfitSum.toFixed(0).toLocaleString();
        }
        passportsMap = map;
        return map;
    } catch (err) {
        console.warn('Could not load passports.csv', err);
        return null;
    }
}

async function getProfit(address) {
    const map = await loadPassports();
    if (!map) return null;
    const addr = address.toLowerCase();
    return map.get(addr) || null;
}

// ------------------- Языковой переключатель -------------------
function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-en]').forEach(el => {
        const attr = el.getAttribute('data-' + lang);
        if (attr !== null) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                const placeholderAttr = el.getAttribute('data-' + lang + '-placeholder');
                if (placeholderAttr !== null) el.placeholder = placeholderAttr;
                else el.value = attr;
            } else {
                el.innerText = attr;
            }
        }
    });
    document.querySelectorAll('#pathSelect option').forEach(opt => {
        const attr = opt.getAttribute('data-' + lang);
        if (attr !== null) opt.innerText = attr;
    });
    // обновляем подсказки на карточках
    const cardIds = ['card1', 'card2', 'card3'];
    cardIds.forEach(id => {
        const card = document.getElementById(id);
        if (card) {
            const titleAttr = card.getAttribute('data-' + lang + '-title');
            if (titleAttr) card.setAttribute('title', titleAttr);
        }
    });
    // активная кнопка
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

// ------------------- I See You (заглушка для отправки токена) -------------------
async function sendISeeYou(address) {
    // В будущем здесь будет вызов смарт-контракта для отправки SBT или транзакции с данными
    console.log(`Sending I See You to ${address}`);
    alert(`✨ I See You token sent to ${address.slice(0,6)}...${address.slice(-4)}! Welcome to the Garden.`);
    // Здесь можно добавить реальную отправку через ethers.js
}

// ------------------- Экспорт для использования в других скриптах (если нужно) -------------------
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { connectWallet, loadPassports, getProfit, setLanguage, sendISeeYou };
}