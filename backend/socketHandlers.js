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
    socket.on('join-team', ({ teamName, roomCode }) => {
        // Basic validation
        if (!teamName) return;

        gameState.teams[socket.id] = {
            id: socket.id,
            name: teamName,
            score: 0,
            totalScore: 0
        };

        socket.join('game-room');
        io.to('game-room').emit('game-update', gameState);
        console.log(`Team joined: ${teamName} (${socket.id})`);
    });

    // --- BUZZER PRESS ---
    socket.on('buzzer-press', ({ clientTimestamp }) => {
        if (!gameState.buzzerEnabled) return;

        // Server-side timestamp is authoritative for sorting, but client timestamp helps debug latency
        const serverTimestamp = Date.now();
        const team = gameState.teams[socket.id];

        if (team) {
            // Check if already buzzed
            const alreadyBuzzed = gameState.buzzerQueue.some(t => t.teamId === socket.id);
            if (alreadyBuzzed) return;

            addToQueue(gameState.buzzerQueue, {
                teamId: team.id,
                name: team.name,
                timestamp: serverTimestamp,
                clientTimestamp
            });

            io.to('game-room').emit('queue-update', gameState.buzzerQueue);
        }
    });

    // --- HOST CONTROLS ---
    // Note: specific host auth should be added for production, strictly relying on event knowledge here for prototype

    socket.on('host-enable-buzzer', () => {
        gameState.buzzerEnabled = true;
        io.to('game-room').emit('buzzer-status', { enabled: true });
    });

    socket.on('host-disable-buzzer', () => {
        gameState.buzzerEnabled = false;
        io.to('game-room').emit('buzzer-status', { enabled: false });
    });

    socket.on('host-reset-buzzer', () => {
        gameState.buzzerEnabled = false;
        gameState.buzzerQueue = [];
        gameState.activeTeam = null;
        io.to('game-room').emit('game-reset');
        io.to('game-room').emit('queue-update', []);
    });

    socket.on('host-set-active-team', (teamId) => {
        // Manual override or promotion
        // Logic for Promote Next Team would go here or separate event
        const team = Object.values(gameState.teams).find(t => t.id === teamId);
        if (team) {
            gameState.activeTeam = team;
            io.to('game-room').emit('active-team-update', team);
        }
    });

    socket.on('host-pass-answer', () => {
        // Remove current active/first in queue
        if (gameState.buzzerQueue.length > 0) {
            gameState.buzzerQueue.shift(); // Remove top
            io.to('game-room').emit('queue-update', gameState.buzzerQueue);

            if (gameState.buzzerQueue.length > 0) {
                // Next team becomes active automatically?
                // Or waiting for host to say "Next"?
                // Let's just update queue, client UI handles "Next" visualization
            }
        }
    });

    socket.on('host-correct-answer', ({ points }) => {
        const activeQueueItem = gameState.buzzerQueue[0];
        if (activeQueueItem) {
            const teamId = activeQueueItem.teamId;
            if (gameState.teams[teamId]) {
                gameState.teams[teamId].score += (points || 10);
                gameState.teams[teamId].totalScore += (points || 10);

                // Clear queue after correct answer
                gameState.buzzerQueue = [];
                gameState.buzzerEnabled = false;

                io.to('game-room').emit('score-update', gameState.teams);
                io.to('game-room').emit('queue-update', []);
                io.to('game-room').emit('buzzer-status', { enabled: false });
            }
        }
    });


    // --- DISCONNECT ---
    socket.on('disconnect', () => {
        /* Optional: Remove team on disconnect? 
           For a game, maybe keep them but mark inactive.
           For now, just log.
        */
        console.log('Client disconnected:', socket.id);
        // delete gameState.teams[socket.id];
        // io.to('game-room').emit('game-update', gameState);
    });
}

module.exports = { registerSocketHandlers };
