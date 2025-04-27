// Game variables
const gameBoard = document.getElementById('game-board');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const startBtn = document.getElementById('start-btn');
const playerNameInput = document.getElementById('player-name');
const playerCountElement = document.getElementById('player-count');
const gameTimeElement = document.getElementById('game-time');
const gameStatusElement = document.getElementById('game-status');

let playerId;
let players = {};
let gameActive = false;
let gameStartTime;
let isIt = false;
let playerRef;
let playersRef;
let gameStateRef;

// Movement variables
const keys = {};
const speed = 5;
const emojis = ['😀', '😎', '🤠', '🧐', '🤩', '😈', '👻', '🤖', '👽', '🐶', '🦊', '🐵'];

// Initialize game
startBtn.addEventListener('click', startGame);
document.addEventListener('keydown', (e) => keys[e.code] = true);
document.addEventListener('keyup', (e) => keys[e.code] = false);

function startGame() {
    const playerName = playerNameInput.value.trim() || 'Player';
    playerId = Math.random().toString(36).substr(2, 9);
    
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    
    // Initialize Firebase references
    playersRef = database.ref('players');
    gameStateRef = database.ref('gameState');
    
    // Create player data
    playerRef = database.ref('players/' + playerId);
    playerRef.set({
        name: playerName,
        x: Math.random() * 500,
        y: Math.random() * 300,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        isIt: false,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    
    // Listen for player updates
    playersRef.on('value', (snapshot) => {
        players = snapshot.val() || {};
        playerCountElement.textContent = Object.keys(players).length;
        renderPlayers();
        checkTag();
    });
    
    // Listen for game state updates
    gameStateRef.on('value', (snapshot) => {
        const state = snapshot.val();
        if (state) {
            gameActive = state.gameActive;
            gameStartTime = state.startTime;
            gameStatusElement.textContent = gameActive ? "Game ON!" : "Waiting...";
            updateGameTimer();
        }
    });
    
    // Start game if not already started and enough players
    gameStateRef.once('value').then((snapshot) => {
        const state = snapshot.val();
        if (!state || !state.gameActive) {
            if (Object.keys(players).length >= 2) {
                startGameSession();
            }
        }
    });
    
    // Start movement loop
    setInterval(movePlayer, 20);
}

function startGameSession() {
    // Choose random "it" player
    const playerIds = Object.keys(players);
    const itPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
    
    database.ref('players/' + itPlayerId).update({ isIt: true });
    gameStateRef.set({
        gameActive: true,
        startTime: Date.now()
    });
}

function updateGameTimer() {
    if (gameActive) {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        gameTimeElement.textContent = elapsed;
        setTimeout(updateGameTimer, 1000);
    }
}

function movePlayer() {
    if (!playerRef) return;
    
    let dx = 0;
    let dy = 0;
    
    if (keys['ArrowLeft'] || keys['KeyA']) dx -= speed;
    if (keys['ArrowRight'] || keys['KeyD']) dx += speed;
    if (keys['ArrowUp'] || keys['KeyW']) dy -= speed;
    if (keys['ArrowDown'] || keys['KeyS']) dy += speed;
    
    playerRef.transaction((player) => {
        if (player) {
            player.x = Math.max(0, Math.min(600 - 30, player.x + dx));
            player.y = Math.max(0, Math.min(400 - 30, player.y + dy));
            player.timestamp = firebase.database.ServerValue.TIMESTAMP;
        }
        return player;
    });
}

function renderPlayers() {
    // Clear existing players
    gameBoard.innerHTML = '';
    
    // Render all players
    for (const id in players) {
        const player = players[id];
        if (player) {
            const playerElement = document.createElement('div');
            playerElement.className = 'player';
            playerElement.textContent = player.emoji;
            playerElement.style.left = player.x + 'px';
            playerElement.style.top = player.y + 'px';
            playerElement.style.color = player.isIt ? '#ff5555' : '#55ff55';
            playerElement.title = player.name + (player.isIt ? ' (IT!)' : '');
            gameBoard.appendChild(playerElement);
        }
    }
}

function checkTag() {
    if (!gameActive || !playerRef) return;
    
    playerRef.once('value').then((snapshot) => {
        const me = snapshot.val();
        if (me && me.isIt !== isIt) {
            isIt = me.isIt;
            alert(isIt ? "You're IT! Tag others!" : "You've been tagged! Run away!");
        }
    });
    
    if (isIt) {
        for (const id in players) {
            if (id !== playerId && players[id]) {
                const other = players[id];
                playerRef.once('value').then((snapshot) => {
                    const me = snapshot.val();
                    if (me) {
                        const distance = Math.sqrt(
                            Math.pow(me.x - other.x, 2) + 
                            Math.pow(me.y - other.y, 2)
                        );
                        
                        if (distance < 30) {
                            // Tag the other player
                            database.ref('players/' + id).update({ isIt: true });
                            playerRef.update({ isIt: false });
                        }
                    }
                });
            }
        }
    }
}

// Clean up on page exit
window.addEventListener('beforeunload', () => {
    if (playerRef) playerRef.remove();
});
