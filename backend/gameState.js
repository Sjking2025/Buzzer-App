function initializeGameState() {
    return {
        teams: {}, // { socketId: { id, name, score, totalScore } }
        rounds: [
            { id: 1, name: "Round 1 - Quiz Buzz", points: 10, scores: {} },
            { id: 2, name: "Round 2 - Code Sprint", points: 20, scores: {} }
        ],
        currentRoundId: 1,
        buzzerEnabled: false,
        buzzerQueue: [], // [{ teamId, name, timestamp }]
        activeTeam: null // The team currently answering
    };
}

module.exports = { initializeGameState };
