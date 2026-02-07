document.addEventListener('DOMContentLoaded', function() {
    // Elemen DOM
    const expressionDisplay = document.getElementById('expression');
    const resultDisplay = document.getElementById('result');
    const equalsBtn = document.getElementById('equals');
    const statusIcon = document.getElementById('status-icon');
    const statusText = document.getElementById('status-text');
    const historyContainer = document.getElementById('history');
    
    // State kalkulator
    let currentExpression = '0';
    let lastResult = '0';
    let isCalculated = false;
    let calculationHistory = [];
    
    // Debug log
    function debugLog(message) {
        console.log(`[Kalkulator] ${message}`);
    }
    
    // Update tampilan
    function updateDisplay() {
        expressionDisplay.textContent = currentExpression || '0';
        resultDisplay.textContent = lastResult;
        
        // Highlight hasil baru
        resultDisplay.classList.remove('highlight');
        void resultDisplay.offsetWidth; // Trigger reflow
        resultDisplay.classList.add('highlight');
        
        debugLog(`Display updated: Expression="${currentExpression}", Result="${lastResult}"`);
    }
    
    // Update status koneksi
    function updateConnectionStatus(connected) {
        const connectionElem = document.querySelector('.connection-status');
        if (connected) {
            statusIcon.innerHTML = '<i class="fas fa-circle"></i>';
            statusIcon.style.color = '#10b981';
            statusText.textContent = 'Terhubung ke server';
            connectionElem.classList.add('connected');
        } else {
            statusIcon.innerHTML = '<i class="fas fa-circle"></i>';
            statusIcon.style.color = '#ef4444';
            statusText.textContent = 'Tidak terhubung ke server';
            connectionElem.classList.remove('connected');
        }
    }
    
    // Tambah riwayat
    function addToHistory(expression, result) {
        calculationHistory.unshift({ expression, result });
        
        // Batasi riwayat menjadi 5 item
        if (calculationHistory.length > 5) {
            calculationHistory.pop();
        }
        
        // Update tampilan riwayat
        updateHistoryDisplay();
    }
    
    // Update tampilan riwayat
    function updateHistoryDisplay() {
        if (calculationHistory.length === 0) {
            historyContainer.innerHTML = '<p class="empty-history">Belum ada perhitungan</p>';
            return;
        }
        
        historyContainer.innerHTML = '';
        calculationHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${item.result}</div>
            `;
            historyContainer.appendChild(historyItem);
        });
    }
    
    // Kirim permintaan ke backend
    async function calculateExpression(expression) {
        debugLog(`Sending expression to server: ${expression}`);
        try {
            const response = await fetch('/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ expression })
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const data = await response.json();
            debugLog(`Server response: ${JSON.stringify(data)}`);
            updateConnectionStatus(true);
            return data;
        } catch (error) {
            console.error('Error:', error);
            updateConnectionStatus(false);
            return {
                result: 'Error',
                message: 'Gagal terhubung ke server. Periksa koneksi Anda.'
            };
        }
    }
    
    // Fungsi lanjutan
    async function advancedCalculation(operation, value) {
        debugLog(`Advanced operation: ${operation}(${value})`);
        try {
            const response = await fetch('/advanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ operation, value })
            });
            
            if (!response.ok) {
                throw new Error('Gagal menghubungi server');
            }
            
            const data = await response.json();
            updateConnectionStatus(true);
            return data;
        } catch (error) {
            console.error('Error:', error);
            updateConnectionStatus(false);
            return {
                result: 'Error',
                message: 'Gagal terhubung ke server'
            };
        }
    }
    
    // Proses perhitungan
    async function calculate() {
        if (!currentExpression || currentExpression === '0') {
            debugLog('Calculation skipped: empty expression');
            return;
        }
        
        // Hapus spasi dan karakter tidak perlu di akhir
        let expressionToCalculate = currentExpression.trim();
        
        // Hapus operator di akhir jika ada
        const lastChar = expressionToCalculate.slice(-1);
        if ('+-*/^%.'.includes(lastChar)) {
            expressionToCalculate = expressionToCalculate.slice(0, -1);
        }
        
        debugLog(`Calculating: ${expressionToCalculate}`);
        
        const result = await calculateExpression(expressionToCalculate);
        
        if (result.result !== 'Error') {
            lastResult = result.result;
            addToHistory(expressionToCalculate, lastResult);
            isCalculated = true;
            debugLog(`Calculation successful: ${expressionToCalculate} = ${lastResult}`);
        } else {
            lastResult = 'Error';
            resultDisplay.title = result.message || 'Ekspresi tidak valid';
            debugLog(`Calculation failed: ${result.message}`);
        }
        
        updateDisplay();
    }
    
    // Proses fungsi lanjutan
    async function handleAdvancedOperation(operation) {
        const value = parseFloat(lastResult);
        
        if (isNaN(value)) {
            lastResult = 'Error';
            resultDisplay.title = 'Nilai tidak valid untuk operasi ini';
            updateDisplay();
            return;
        }
        
        const result = await advancedCalculation(operation, value);
        
        if (result.result !== 'Error') {
            lastResult = result.result;
            addToHistory(`${operation}(${value})`, lastResult);
            currentExpression = lastResult;
            isCalculated = true;
        } else {
            lastResult = 'Error';
            resultDisplay.title = result.message || 'Operasi tidak valid';
        }
        
        updateDisplay();
    }
    
    // Event handler untuk tombol
    function handleButtonClick(event) {
        const button = event.target.closest('.btn');
        if (!button) {
            debugLog('No button found for click');
            return;
        }
        
        const value = button.getAttribute('data-value');
        const action = button.getAttribute('data-action');
        
        debugLog(`Button clicked: value="${value}", action="${action}"`);
        
        // Jika tombol angka atau operator
        if (value !== null) {
            if (isCalculated) {
                currentExpression = '';
                isCalculated = false;
            }
            
            if (currentExpression === '0' && value !== '.' && !'+-*/^%'.includes(value)) {
                currentExpression = value;
            } else {
                currentExpression += value;
            }
            
            lastResult = '0';
            updateDisplay();
        }
        
        // Jika tombol aksi khusus
        if (action !== null) {
            switch(action) {
                case 'clear':
                    // Hapus satu karakter
                    if (currentExpression.length > 1) {
                        currentExpression = currentExpression.slice(0, -1);
                    } else {
                        currentExpression = '0';
                    }
                    updateDisplay();
                    break;
                    
                case 'clear-all':
                    // Hapus semua
                    currentExpression = '0';
                    lastResult = '0';
                    updateDisplay();
                    break;
                    
                case 'backspace':
                    // Hapus karakter terakhir
                    if (currentExpression.length > 1) {
                        currentExpression = currentExpression.slice(0, -1);
                    } else {
                        currentExpression = '0';
                    }
                    updateDisplay();
                    break;
                    
                case 'equals':
                    calculate();
                    break;
                    
                // Fungsi lanjutan
                case 'sqrt':
                case 'square':
                case 'sin':
                case 'cos':
                case 'tan':
                case 'log':
                case 'ln':
                    handleAdvancedOperation(action);
                    break;
            }
        }
    }
    
    // Event listener untuk keyboard
    function handleKeyboardInput(event) {
        const key = event.key;
        debugLog(`Key pressed: ${key}`);
        
        // Angka 0-9
        if (/[0-9]/.test(key)) {
            event.preventDefault();
            const button = document.querySelector(`.btn[data-value="${key}"]`);
            if (button) button.click();
        }
        
        // Operator dasar
        else if (['+', '-', '*', '/', '%', '^', '.', '(', ')'].includes(key)) {
            event.preventDefault();
            const button = document.querySelector(`.btn[data-value="${key}"]`);
            if (button) button.click();
        }
        
        // Enter atau = untuk kalkulasi
        else if (key === 'Enter' || key === '=') {
            event.preventDefault();
            equalsBtn.click();
        }
        
        // Escape atau Delete untuk menghapus
        else if (key === 'Escape' || key === 'Delete') {
            event.preventDefault();
            const button = document.querySelector('.btn[data-action="clear-all"]');
            if (button) button.click();
        }
        
        // Backspace untuk menghapus satu karakter
        else if (key === 'Backspace') {
            event.preventDefault();
            const button = document.querySelector('.btn[data-action="backspace"]');
            if (button) button.click();
        }
    }
    
    // Inisialisasi
    function init() {
        debugLog('Kalkulator initializing...');
        updateDisplay();
        updateConnectionStatus(false);
        
        // Coba koneksi ke server
        fetch('/')
            .then(response => {
                if (response.ok) {
                    updateConnectionStatus(true);
                    debugLog('Connected to server');
                }
            })
            .catch((error) => {
                updateConnectionStatus(false);
                debugLog(`Failed to connect: ${error}`);
            });
        
        // Event listener untuk tombol
        const buttonsContainer = document.querySelector('.buttons');
        if (buttonsContainer) {
            buttonsContainer.addEventListener('click', handleButtonClick);
            debugLog('Button event listeners attached');
        } else {
            console.error('Buttons container not found!');
        }
        
        // Event listener untuk keyboard
        document.addEventListener('keydown', handleKeyboardInput);
        
        // Debug: log semua tombol yang ada
        const allButtons = document.querySelectorAll('.btn');
        debugLog(`Found ${allButtons.length} buttons`);
        
        // Tambahkan event listener manual untuk tombol =
        if (equalsBtn) {
            equalsBtn.addEventListener('click', calculate);
        }
        
        debugLog('Kalkulator initialized successfully');
    }
    
    // Jalankan inisialisasi
    init();
});