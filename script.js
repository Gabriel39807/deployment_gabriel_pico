// ========================================
// VARIABLES GLOBALES DEL JUEGO
// ========================================

// Símbolos de emojis para las cartas (8 pares diferentes)
const symbols = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🍉', '🍍'];

// Variables de estado del juego
let cards = []; // Array que contendrá todas las cartas duplicadas y mezcladas
let flippedCards = []; // Cartas que están actualmente volteadas
let matchedPairs = 0; // Contador de parejas encontradas
let attempts = 0; // Contador de intentos realizados
let gameStarted = false; // Indica si el juego ha iniciado
let lockBoard = false; // Bloquea el tablero para evitar clics durante animaciones

// Variables del temporizador
let timerInterval = null; // Referencia al intervalo del temporizador
let seconds = 0; // Contador de segundos

// ========================================
// REFERENCIAS A ELEMENTOS DEL DOM
// ========================================
const gameBoard = document.getElementById('game-board');
const attemptsDisplay = document.getElementById('attempts');
const timerDisplay = document.getElementById('timer');
const pairsDisplay = document.getElementById('pairs');
const restartBtn = document.getElementById('restart-btn');
const victoryModal = document.getElementById('victory-modal');
const playAgainBtn = document.getElementById('play-again-btn');
const finalTime = document.getElementById('final-time');
const finalAttempts = document.getElementById('final-attempts');

// ========================================
// FUNCIÓN DE INICIALIZACIÓN DEL JUEGO
// ========================================
function initGame() {
    // Resetear todas las variables del juego
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    attempts = 0;
    seconds = 0;
    gameStarted = false;
    lockBoard = false;
    
    // Detener el temporizador si existe
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Actualizar los displays
    updateDisplays();
    
    // Crear array de cartas (cada símbolo aparece dos veces)
    const cardSymbols = [...symbols, ...symbols];
    
    // Mezclar las cartas aleatoriamente usando el algoritmo Fisher-Yates
    shuffleArray(cardSymbols);
    
    // Limpiar el tablero
    gameBoard.innerHTML = '';
    
    // Crear y renderizar las cartas en el DOM
    cardSymbols.forEach((symbol, index) => {
        const card = createCard(symbol, index);
        gameBoard.appendChild(card);
    });
    
    // Ocultar el modal de victoria si está visible
    victoryModal.classList.remove('show');
}

// ========================================
// FUNCIÓN PARA CREAR UNA CARTA
// ========================================
function createCard(symbol, index) {
    // Crear elemento div para la carta
    const card = document.createElement('div');
    card.classList.add('card', 'hidden');
    card.dataset.symbol = symbol; // Guardar el símbolo en un atributo data
    card.dataset.index = index; // Guardar el índice para referencia
    
    // Agregar evento de clic a la carta
    card.addEventListener('click', () => handleCardClick(card));
    
    return card;
}

// ========================================
// MANEJADOR DE CLIC EN UNA CARTA
// ========================================
function handleCardClick(card) {
    // Ignorar clics si el tablero está bloqueado o la carta ya está volteada/emparejada
    if (lockBoard) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;
    
    // Iniciar el temporizador en el primer clic
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    // Voltear la carta
    flipCard(card);
    
    // Agregar la carta al array de cartas volteadas
    flippedCards.push(card);
    
    // Si hay dos cartas volteadas, verificar si coinciden
    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

// ========================================
// FUNCIÓN PARA VOLTEAR UNA CARTA
// ========================================
function flipCard(card) {
    // Remover la clase 'hidden' y agregar 'flipped'
    card.classList.remove('hidden');
    card.classList.add('flipped');
    // Mostrar el símbolo de la carta
    card.textContent = card.dataset.symbol;
}

// ========================================
// FUNCIÓN PARA VERIFICAR SI HAY COINCIDENCIA
// ========================================
function checkForMatch() {
    // Bloquear el tablero para evitar más clics
    lockBoard = true;
    
    // Incrementar el contador de intentos
    attempts++;
    updateDisplays();
    
    // Obtener los símbolos de las dos cartas volteadas
    const [card1, card2] = flippedCards;
    const symbol1 = card1.dataset.symbol;
    const symbol2 = card2.dataset.symbol;
    
    // Verificar si los símbolos coinciden
    if (symbol1 === symbol2) {
        // ¡Coincidencia! Marcar las cartas como emparejadas
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            updateDisplays();
            
            // Limpiar las cartas volteadas y desbloquear el tablero
            flippedCards = [];
            lockBoard = false;
            
            // Verificar si el juego está completo
            if (matchedPairs === symbols.length) {
                endGame();
            }
        }, 500);
    } else {
        // No coinciden, voltear las cartas de nuevo
        setTimeout(() => {
            card1.classList.remove('flipped');
            card1.classList.add('hidden');
            card1.textContent = '';
            
            card2.classList.remove('flipped');
            card2.classList.add('hidden');
            card2.textContent = '';
            
            // Limpiar las cartas volteadas y desbloquear el tablero
            flippedCards = [];
            lockBoard = false;
        }, 1000);
    }
}

// ========================================
// FUNCIÓN PARA MEZCLAR UN ARRAY
// ========================================
function shuffleArray(array) {
    // Algoritmo Fisher-Yates para mezclar aleatoriamente
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ========================================
// FUNCIONES DEL TEMPORIZADOR
// ========================================

// Iniciar el temporizador
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000); // Actualizar cada segundo
}

// Detener el temporizador
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Actualizar la visualización del temporizador
function updateTimerDisplay() {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    // Formatear con ceros a la izquierda (00:00)
    timerDisplay.textContent = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ========================================
// FUNCIÓN PARA ACTUALIZAR LOS DISPLAYS
// ========================================
function updateDisplays() {
    attemptsDisplay.textContent = attempts;
    pairsDisplay.textContent = `${matchedPairs}/${symbols.length}`;
    updateTimerDisplay();
}

// ========================================
// FUNCIÓN PARA FINALIZAR EL JUEGO
// ========================================
function endGame() {
    // Detener el temporizador
    stopTimer();
    
    // Mostrar los resultados finales en el modal
    finalTime.textContent = timerDisplay.textContent;
    finalAttempts.textContent = attempts;
    
    // Mostrar el modal de victoria después de una breve pausa
    setTimeout(() => {
        victoryModal.classList.add('show');
    }, 500);
}

// ========================================
// EVENT LISTENERS
// ========================================

// Botón de reiniciar juego
restartBtn.addEventListener('click', initGame);

// Botón de jugar de nuevo en el modal
playAgainBtn.addEventListener('click', initGame);

// ========================================
// INICIAR EL JUEGO AL CARGAR LA PÁGINA
// ========================================
initGame();