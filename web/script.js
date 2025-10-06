// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Chess pieces mapping
const PIECES = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

// State
let currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
let modelInitialized = false;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeBoard();
    attachEventListeners();
    checkServerStatus();
});

// Initialize chess board
function initializeBoard() {
    const board = document.getElementById('chess-board');
    board.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            board.appendChild(square);
        }
    }
    
    loadFenToBoard(currentFen);
}

// Load FEN to board
function loadFenToBoard(fen) {
    const board = document.getElementById('chess-board');
    const squares = board.querySelectorAll('.square');
    
    // Clear all squares
    squares.forEach(square => square.textContent = '');
    
    // Parse FEN
    const parts = fen.split(' ');
    const position = parts[0];
    const turn = parts[1];
    
    // Update turn indicator
    document.getElementById('turn-indicator').textContent = 
        `Tour: ${turn === 'w' ? 'Blancs' : 'Noirs'}`;
    
    const rows = position.split('/');
    let squareIndex = 0;
    
    rows.forEach(row => {
        let colIndex = 0;
        for (let char of row) {
            if (isNaN(char)) {
                // It's a piece
                const square = squares[squareIndex];
                if (square) {
                    square.textContent = PIECES[char] || '';
                }
                squareIndex++;
                colIndex++;
            } else {
                // It's a number (empty squares)
                const emptySquares = parseInt(char);
                squareIndex += emptySquares;
                colIndex += emptySquares;
            }
        }
    });
    
    currentFen = fen;
}

// Attach event listeners
function attachEventListeners() {
    // Init model button
    document.getElementById('init-model-btn').addEventListener('click', initializeModel);
    
    // Predict button
    document.getElementById('predict-btn').addEventListener('click', makePrediction);
    
    // Reset board button
    document.getElementById('reset-board-btn').addEventListener('click', resetBoard);
    
    // Load FEN button
    document.getElementById('load-fen-btn').addEventListener('click', loadCustomFen);
    
    // FEN input - update on Enter
    document.getElementById('fen-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadCustomFen();
        }
    });
}

// Check server status
async function checkServerStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/status`);
        const data = await response.json();
        
        if (data.success && data.initialized) {
            modelInitialized = true;
            updateStatus('ready', 'Modèle prêt');
            document.getElementById('predict-btn').disabled = false;
        }
    } catch (error) {
        console.log('Server not ready or not started');
    }
}

// Initialize model
async function initializeModel() {
    const modelType = document.querySelector('input[name="model-type"]:checked').value;
    const device = document.querySelector('input[name="device"]:checked').value;
    
    showLoading('Initialisation du modèle...');
    updateStatus('loading', 'Chargement...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model_type: modelType,
                device: device
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            modelInitialized = true;
            updateStatus('ready', 'Modèle prêt');
            document.getElementById('predict-btn').disabled = false;
            showToast('success', data.message);
        } else {
            updateStatus('error', 'Erreur');
            showToast('error', data.message);
        }
    } catch (error) {
        updateStatus('error', 'Erreur de connexion');
        showToast('error', 'Impossible de se connecter au serveur. Assurez-vous que le serveur est démarré.');
    } finally {
        hideLoading();
    }
}

// Make prediction
async function makePrediction() {
    if (!modelInitialized) {
        showToast('warning', 'Veuillez d\'abord initialiser le modèle');
        return;
    }
    
    const eloSelf = parseInt(document.getElementById('elo-self').value);
    const eloOpponent = parseInt(document.getElementById('elo-opponent').value);
    const topK = parseInt(document.getElementById('top-k').value);
    
    showLoading('Prédiction en cours...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fen: currentFen,
                elo_self: eloSelf,
                elo_opponent: eloOpponent,
                top_k: topK
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayResults(data);
            showToast('success', 'Prédiction réussie');
        } else {
            showToast('error', data.message);
        }
    } catch (error) {
        showToast('error', 'Erreur lors de la prédiction');
    } finally {
        hideLoading();
    }
}

// Display results
function displayResults(data) {
    // Hide empty state
    document.getElementById('results-content').style.display = 'none';
    
    // Show win probability
    const winProbSection = document.getElementById('win-probability');
    winProbSection.style.display = 'block';
    
    const winProb = data.win_probability;
    const winProbPercent = (winProb * 100).toFixed(1);
    
    document.getElementById('probability-fill').style.width = `${winProbPercent}%`;
    document.getElementById('probability-text').textContent = `${winProbPercent}%`;
    
    // Show move suggestions
    const suggestionsSection = document.getElementById('move-suggestions');
    suggestionsSection.style.display = 'block';
    
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';
    
    data.top_moves.forEach((move, index) => {
        const moveProb = (move.probability * 100).toFixed(1);
        
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        
        item.innerHTML = `
            <div class="suggestion-rank">${index + 1}</div>
            <div class="suggestion-move">${move.move}</div>
            <div class="suggestion-bar">
                <div class="suggestion-bar-fill" style="width: ${moveProb}%"></div>
            </div>
            <div class="suggestion-probability">${moveProb}%</div>
        `;
        
        suggestionsList.appendChild(item);
    });
}

// Reset board
function resetBoard() {
    currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    document.getElementById('fen-input').value = currentFen;
    loadFenToBoard(currentFen);
    
    // Hide results
    document.getElementById('results-content').style.display = 'block';
    document.getElementById('win-probability').style.display = 'none';
    document.getElementById('move-suggestions').style.display = 'none';
    
    showToast('info', 'Échiquier réinitialisé');
}

// Load custom FEN
async function loadCustomFen() {
    const fenInput = document.getElementById('fen-input').value.trim();
    
    if (!fenInput) {
        showToast('warning', 'Veuillez entrer une position FEN');
        return;
    }
    
    showLoading('Validation de la position...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/validate_fen`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fen: fenInput })
        });
        
        const data = await response.json();
        
        if (data.valid) {
            loadFenToBoard(fenInput);
            showToast('success', 'Position chargée avec succès');
        } else {
            showToast('error', data.message);
        }
    } catch (error) {
        showToast('error', 'Erreur lors de la validation');
    } finally {
        hideLoading();
    }
}

// Update status indicator
function updateStatus(status, text) {
    const statusSection = document.querySelector('.status-indicator');
    const statusText = document.getElementById('status-text');
    
    statusSection.className = `status-indicator ${status}`;
    statusText.textContent = text;
}

// Show loading overlay
function showLoading(text = 'Chargement...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    
    loadingText.textContent = text;
    overlay.classList.add('show');
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.remove('show');
}

// Show toast notification
function showToast(type, message) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');
    
    // Set icon based on type
    const icons = {
        'success': 'check_circle',
        'error': 'error',
        'warning': 'warning',
        'info': 'info'
    };
    
    toastIcon.textContent = icons[type] || 'info';
    toastMessage.textContent = message;
    
    // Reset classes and add new type
    toast.className = `toast ${type}`;
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

