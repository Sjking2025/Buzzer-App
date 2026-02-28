const { addToQueue, getSortedQueue } = require('./utils/timestampQueue');
const { calculateScore } = require('./utils/scoring');

function registerSocketHandlers(io, socket, gameState) {

    // Send initial state to the connecting client
    socket.emit('game-update', gameState);
    socket.emit('buzzer-status', { enabled: gameState.buzzerEnabled });
    socket.emit('queue-update', gameState.buzzerQueue);

    // --- GET GAME STATE ---
    socket.on('get-game-state', () => {
        socket.emit('game-update', gameState);
        socket.emit('buzzer-status', { enabled: gameState.buzzerEnabled });
        socket.emit('queue-update', gameState.buzzerQueue);
    });

    // --- JOIN TEAM ---
    socket.on('join-team', ({ teamName }) => {
        if (!teamName) return;

        gameState.teams[socket.id] = {
            id: socket.id,
            name: teamName,
            score: 0,
            totalScore: 0
        };

        socket.join('game-room');
        // Broadcast updated game state to all (including host)
        io.emit('game-update', gameState);
        console.log(`Team joined: ${teamName} (${socket.id})`);
    });

    // --- BUZZER PRESS ---
    socket.on('buzzer-press', ({ clientTimestamp }) => {
        if (!gameState.buzzerEnabled) return;

        const serverTimestamp = Date.now();
        const team = gameState.teams[socket.id];

        if (team) {
            // Prevent duplicate buzzes
            const alreadyBuzzed = gameState.buzzerQueue.some(t => t.teamId === socket.id);
            if (alreadyBuzzed) return;

            addToQueue(gameState.buzzerQueue, {
                teamId: team.id,
                name: team.name,
                timestamp: serverTimestamp,
                clientTimestamp
            });

            // Broadcast to ALL connected clients (including host)
            io.emit('queue-update', gameState.buzzerQueue);
        }
    });

    // --- HOST CONTROLS ---

    socket.on('host-enable-buzzer', () => {
        gameState.buzzerEnabled = true;
        io.emit('buzzer-status', { enabled: true });
    });

    socket.on('host-disable-buzzer', () => {
        gameState.buzzerEnabled = false;
        io.emit('buzzer-status', { enabled: false });
    });

    socket.on('host-reset-buzzer', () => {
        gameState.buzzerEnabled = false;
        gameState.buzzerQueue = [];
        gameState.activeTeam = null;
        io.emit('game-reset');
        io.emit('queue-update', []);
        io.emit('buzzer-status', { enabled: false });
    });

    // End question: no points, clear queue
    socket.on('host-end-question', () => {
        gameState.buzzerEnabled = false;
        gameState.buzzerQueue = [];
        gameState.activeTeam = null;
        io.emit('game-reset');
        io.emit('queue-update', []);
        io.emit('buzzer-status', { enabled: false });
        console.log('Question ended by host (no points awarded)');
    });

    socket.on('host-pass-answer', () => {
        if (gameState.buzzerQueue.length > 0) {
            const passedTeam = gameState.buzzerQueue.shift(); // Remove rank 1
            console.log(`Passed: ${passedTeam.name}`);
            io.emit('queue-update', gameState.buzzerQueue);
        }
    });

    socket.on('host-correct-answer', ({ points }) => {
        const activeQueueItem = gameState.buzzerQueue[0];
        if (activeQueueItem) {
            const teamId = activeQueueItem.teamId;
            if (gameState.teams[teamId]) {
                const awarded = points || 10;
                gameState.teams[teamId].score += awarded;
                gameState.teams[teamId].totalScore += awarded;

                // Clear queue & disable buzzer after correct answer
                gameState.buzzerQueue = [];
                gameState.buzzerEnabled = false;
                gameState.activeTeam = null;

                io.emit('score-update', gameState.teams);
                io.emit('queue-update', []);
                io.emit('buzzer-status', { enabled: false });
                io.emit('game-reset');
                console.log(`Correct! ${gameState.teams[teamId].name} awarded ${awarded} points`);
            }
        }
    });

    // --- DISCONNECT ---
    socket.on('disconnect', () => {
        const team = gameState.teams[socket.id];
        if (team) {
            console.log(`Team disconnected: ${team.name} (${socket.id})`);
            // Remove from queue if present
            const queueIndex = gameState.buzzerQueue.findIndex(t => t.teamId === socket.id);
            if (queueIndex !== -1) {
                gameState.buzzerQueue.splice(queueIndex, 1);
                io.emit('queue-update', gameState.buzzerQueue);
            }
            // Mark as disconnected but keep score
            gameState.teams[socket.id].disconnected = true;
            io.emit('game-update', gameState);
        } else {
            console.log('Client disconnected:', socket.id);
        }
    });
}

module.exports = { registerSocketHandlers };
