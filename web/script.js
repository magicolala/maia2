import { NeoChessBoard } from './neochess/index.js';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// State
let currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
let modelInitialized = false;
let board;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeBoard();
    attachEventListeners();
    checkServerStatus();
});

// Initialize chess board
function initializeBoard() {
    const boardContainer = document.getElementById('chess-board');
    boardContainer.innerHTML = '';
    board = new NeoChessBoard(boardContainer, {
        position: currentFen,
    });

    board.on('move', (move) => {
        currentFen = move.fen;
        document.getElementById('fen-input').value = currentFen;
        const turn = board.getTurn();
        document.getElementById('turn-indicator').textContent =
            `Tour: ${turn === 'w' ? 'Blancs' : 'Noirs'}`;
    });
}

// Load FEN to board
function loadFenToBoard(fen) {
    if (board) {
        board.setPosition(fen);
    }
    currentFen = fen;

    const parts = fen.split(' ');
    const turn = parts[1];
    document.getElementById('turn-indicator').textContent =
        `Tour: ${turn === 'w' ? 'Blancs' : 'Noirs'}`;
}

// Attach event listeners
function attachEventListeners() {
    document.getElementById('init-model-btn').addEventListener('click', initializeModel);
    document.getElementById('predict-btn').addEventListener('click', makePrediction);
    document.getElementById('reset-board-btn').addEventListener('click', resetBoard);
    document.getElementById('load-fen-btn').addEventListener('click', loadCustomFen);
    document.getElementById('fen-input').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
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
            updateStatus('ready', 'Mod\u00e8le pr\u00eat');
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

    showLoading('Initialisation du mod\u00e8le...');
    updateStatus('loading', 'Chargement...');

    try {
        const response = await fetch(`${API_BASE_URL}/init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model_type: modelType,
                device: device,
            }),
        });

        const data = await response.json();

        if (data.success) {
            modelInitialized = true;
            updateStatus('ready', 'Mod\u00e8le pr\u00eat');
            document.getElementById('predict-btn').disabled = false;
            showToast('success', data.message);
        } else {
            updateStatus('error', 'Erreur');
            showToast('error', data.message);
        }
    } catch (error) {
        updateStatus('error', 'Erreur de connexion');
        showToast('error', 'Impossible de se connecter au serveur. Assurez-vous que le serveur est d\u00e9marr\u00e9.');
    } finally {
        hideLoading();
    }
}

// Make prediction
async function makePrediction() {
    if (!modelInitialized) {
        showToast('warning', 'Veuillez d\'abord initialiser le mod\u00e8le');
        return;
    }

    const eloSelf = parseInt(document.getElementById('elo-self').value, 10) || 1500;
    const eloOpponent = parseInt(document.getElementById('elo-opponent').value, 10) || 1500;
    const topK = parseInt(document.getElementById('top-k').value, 10);

    showLoading('Pr\u00e9diction en cours...');

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
                top_k: topK,
            }),
        });

        const data = await response.json();

        if (data.success) {
            displayResults(data);
            showToast('success', 'Pr\u00e9diction r\u00e9ussie');
        } else {
            showToast('error', data.message);
        }
    } catch (error) {
        showToast('error', 'Erreur lors de la pr\u00e9diction');
    } finally {
        hideLoading();
    }
}

// Display results
function displayResults(data) {
    document.getElementById('results-content').style.display = 'none';

    const winProbSection = document.getElementById('win-probability');
    winProbSection.style.display = 'block';

    const winProb = data.win_probability;
    const winProbPercent = (winProb * 100).toFixed(1);

    document.getElementById('probability-fill').style.width = `${winProbPercent}%`;
    document.getElementById('probability-text').textContent = `${winProbPercent}%`;

    if (data.top_moves && data.top_moves.length > 0) {
        const nextMoveProbSection = document.getElementById('next-move-probability');
        nextMoveProbSection.style.display = 'block';

        const nextMove = data.top_moves[0];
        const nextMoveProb = (nextMove.probability * 100).toFixed(1);

        document.getElementById('next-move-probability-fill').style.width = `${nextMoveProb}%`;
        document.getElementById('next-move-probability-text').textContent = `${nextMoveProb}%`;
        document.getElementById('next-move-text').textContent = `Coup le plus probable : ${nextMove.move}`;
    }

    const suggestionsSection = document.getElementById('move-suggestions');
    suggestionsSection.style.display = 'block';

    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';

    data.top_moves.forEach((move, index) => {
        const moveProb = (move.probability * 100).toFixed(1);

        const item = document.createElement('div');
        item.className = 'group relative flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 shadow-inner-card transition duration-300 hover:-translate-y-0.5 hover:border-primary-light/70 hover:bg-primary/10 sm:flex-row sm:items-center sm:gap-4';

        item.innerHTML = `
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-xl font-bold text-primary-light backdrop-blur-sm sm:text-2xl">${index + 1}</div>
            <div class="flex-1 font-mono text-lg text-white">${move.move}</div>
            <div class="hidden h-2 flex-1 overflow-hidden rounded-full bg-white/10 sm:block">
                <div class="h-full rounded-full bg-gradient-to-r from-secondary via-primary to-primary-light" style="width: ${moveProb}%"></div>
            </div>
            <div class="text-sm font-semibold text-text-secondary sm:w-16 sm:text-right">${moveProb}%</div>
        `;

        suggestionsList.appendChild(item);
    });
}

// Reset board
function resetBoard() {
    currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    document.getElementById('fen-input').value = currentFen;

    if (board) {
        board.reset();
    }

    document.getElementById('results-content').style.display = 'block';
    document.getElementById('win-probability').style.display = 'none';
    document.getElementById('next-move-probability').style.display = 'none';
    document.getElementById('move-suggestions').style.display = 'none';

    showToast('info', '\u00c9chiquier r\u00e9initialis\u00e9');
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
            body: JSON.stringify({ fen: fenInput }),
        });

        const data = await response.json();

        if (data.valid) {
            loadFenToBoard(fenInput);
            showToast('success', 'Position charg\u00e9e avec succ\u00e8s');
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
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    statusDot.classList.remove(
        'bg-border-color',
        'bg-secondary',
        'bg-warning',
        'bg-error',
        'animate-pulse',
        'shadow-[0_0_12px_rgba(148,163,184,0.4)]',
        'shadow-[0_0_15px_rgba(34,211,238,0.65)]',
        'shadow-[0_0_15px_rgba(250,204,21,0.45)]',
        'shadow-[0_0_15px_rgba(239,68,68,0.5)]'
    );

    switch (status) {
        case 'ready':
            statusDot.classList.add('bg-secondary', 'shadow-[0_0_15px_rgba(34,211,238,0.65)]');
            break;
        case 'loading':
            statusDot.classList.add('bg-warning', 'shadow-[0_0_15px_rgba(250,204,21,0.45)]', 'animate-pulse');
            break;
        case 'error':
            statusDot.classList.add('bg-error', 'shadow-[0_0_15px_rgba(239,68,68,0.5)]');
            break;
        default:
            statusDot.classList.add('bg-border-color', 'shadow-[0_0_12px_rgba(148,163,184,0.4)]', 'animate-pulse');
    }

    statusText.textContent = text;
}

// Show loading overlay
function showLoading(text = 'Chargement...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');

    loadingText.textContent = text;
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.remove('flex');
    overlay.classList.add('hidden');
}

// Show toast notification
function showToast(type, message) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');

    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info',
    };

    toastIcon.textContent = icons[type] || 'info';
    toastMessage.textContent = message;

    toast.classList.remove(
        'border-secondary/60',
        'border-error/60',
        'border-warning/60',
        'border-primary/60',
        'bg-secondary/20',
        'bg-error/20',
        'bg-warning/20',
        'bg-primary/20'
    );

    toastIcon.classList.remove('text-secondary', 'text-error', 'text-warning', 'text-success', 'text-primary-light');

    switch (type) {
        case 'success':
            toast.classList.add('border-secondary/60', 'bg-secondary/20');
            toastIcon.classList.add('text-success');
            break;
        case 'error':
            toast.classList.add('border-error/60', 'bg-error/20');
            toastIcon.classList.add('text-error');
            break;
        case 'warning':
            toast.classList.add('border-warning/60', 'bg-warning/20');
            toastIcon.classList.add('text-warning');
            break;
        default:
            toast.classList.add('border-primary/60', 'bg-primary/20');
            toastIcon.classList.add('text-primary-light');
    }

    toast.classList.remove('translate-y-[200%]');
    toast.classList.add('translate-y-0');

    setTimeout(() => {
        toast.classList.remove('translate-y-0');
        toast.classList.add('translate-y-[200%]');
    }, 4000);
}
