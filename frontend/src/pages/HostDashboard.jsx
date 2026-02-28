import React, { useEffect, useState } from 'react';
import { socket } from '../socket';
import QueueDisplay from '../components/QueueDisplay';
import { Mic, CheckCircle, XCircle, SkipForward } from 'lucide-react';

const HostDashboard = () => {
    const [buzzerEnabled, setBuzzerEnabled] = useState(false);
    const [queue, setQueue] = useState([]);
    const [activeTeam, setActiveTeam] = useState(null);
    const [teams, setTeams] = useState({});

    useEffect(() => {
        if (!socket.connected) socket.connect();

        socket.emit('get-game-state');
        socket.emit('host-disable-buzzer');

        const onQueueUpdate = (q) => {
            setQueue(q);
            setActiveTeam(q.length > 0 ? q[0] : null);
        };

        const onBuzzerStatus = ({ enabled }) => setBuzzerEnabled(enabled);

        const onGameUpdate = (gameState) => {
            if (gameState?.teams) setTeams(gameState.teams);
            if (gameState?.buzzerQueue) {
                setQueue(gameState.buzzerQueue);
                setActiveTeam(gameState.buzzerQueue.length > 0 ? gameState.buzzerQueue[0] : null);
            }
            if (gameState !== undefined) setBuzzerEnabled(gameState.buzzerEnabled);
        };

        const onScoreUpdate = (updatedTeams) => setTeams(updatedTeams);

        const onGameReset = () => {
            setQueue([]);
            setActiveTeam(null);
            setBuzzerEnabled(false);
        };

        socket.on('queue-update', onQueueUpdate);
        socket.on('buzzer-status', onBuzzerStatus);
        socket.on('game-update', onGameUpdate);
        socket.on('score-update', onScoreUpdate);
        socket.on('game-reset', onGameReset);

        return () => {
            socket.off('queue-update', onQueueUpdate);
            socket.off('buzzer-status', onBuzzerStatus);
            socket.off('game-update', onGameUpdate);
            socket.off('score-update', onScoreUpdate);
            socket.off('game-reset', onGameReset);
        };
    }, []);

    const enableBuzzer = () => socket.emit('host-enable-buzzer');
    const disableBuzzer = () => socket.emit('host-disable-buzzer');
    const resetBuzzer = () => socket.emit('host-reset-buzzer');
    const handleCorrect = () => socket.emit('host-correct-answer', { points: 10 });
    const handlePass = () => socket.emit('host-pass-answer');
    const handleEndQuestion = () => socket.emit('host-end-question');

    return (
        <div className="min-h-screen bg-cyber-dark text-white p-3 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex flex-col gap-4 sm:gap-6">
                {/* Game Control Panel */}
                <div className="bg-cyber-black p-4 sm:p-6 rounded-lg border border-gray-800 shadow-lg">
                    <h2 className="text-xl sm:text-2xl font-mono text-cyber-neonBlue mb-3 sm:mb-4 flex items-center gap-2">
                        <Mic size={20} /> GAME CONTROL
                    </h2>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <button
                            onClick={enableBuzzer}
                            disabled={buzzerEnabled}
                            className={`p-3 sm:p-4 rounded font-bold text-base sm:text-xl transition-all font-mono ${
                                buzzerEnabled
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-cyber-neonGreen text-black hover:bg-green-400 active:scale-95'
                            }`}
                        >
                            ENABLE
                        </button>

                        <button
                            onClick={disableBuzzer}
                            disabled={!buzzerEnabled}
                            className={`p-3 sm:p-4 rounded font-bold text-base sm:text-xl transition-all font-mono ${
                                !buzzerEnabled
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-cyber-neonRed text-black hover:bg-red-500 active:scale-95'
                            }`}
                        >
                            DISABLE
                        </button>
                    </div>

                    <button
                        onClick={resetBuzzer}
                        className="w-full p-2.5 sm:p-3 rounded border border-gray-600 hover:bg-gray-800 text-gray-400 hover:text-white transition-all font-mono text-xs sm:text-sm active:scale-95"
                    >
                        🔄 RESET ROUND / NEXT QUESTION
                    </button>
                </div>

                {/* Active Team Action Panel */}
                {activeTeam ? (
                    <div className="bg-cyber-black p-4 sm:p-6 rounded-lg border border-cyber-neonBlue shadow-[0_0_15px_rgba(0,204,255,0.2)]">
                        <h2 className="text-base sm:text-xl font-mono text-gray-400 mb-1 sm:mb-2">ACTIVE TEAM</h2>
                        <div className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">{activeTeam.name}</div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
                            <button
                                onClick={handleCorrect}
                                className="flex items-center justify-center gap-1.5 sm:gap-2 bg-green-900/50 border border-green-500 text-green-400 p-3 sm:p-4 rounded hover:bg-green-900 transition-all font-bold font-mono text-sm sm:text-base active:scale-95"
                            >
                                <CheckCircle size={16} /> CORRECT (+10)
                            </button>
                            <button
                                onClick={handlePass}
                                className="flex items-center justify-center gap-1.5 sm:gap-2 bg-red-900/50 border border-red-500 text-red-400 p-3 sm:p-4 rounded hover:bg-red-900 transition-all font-bold font-mono text-sm sm:text-base active:scale-95"
                            >
                                <XCircle size={16} /> WRONG / PASS
                            </button>
                        </div>

                        <button
                            onClick={handleEndQuestion}
                            className="w-full flex items-center justify-center gap-2 bg-gray-800/50 border border-gray-600 text-gray-400 p-2.5 sm:p-3 rounded hover:bg-gray-700 transition-all font-mono text-xs sm:text-sm active:scale-95"
                        >
                            <SkipForward size={14} /> END QUESTION (No Points)
                        </button>
                    </div>
                ) : (
                    <div className="bg-cyber-black p-4 sm:p-6 rounded-lg border border-gray-800 text-center text-gray-600 font-mono text-xs sm:text-sm">
                        No active team. Enable buzzer and wait for teams to buzz in.
                    </div>
                )}

                {/* Score Summary */}
                {Object.keys(teams).length > 0 && (
                    <div className="bg-cyber-black p-4 sm:p-6 rounded-lg border border-gray-800">
                        <h2 className="text-lg sm:text-xl font-mono text-cyber-neonGreen mb-3 sm:mb-4">SCORES</h2>
                        <div className="flex flex-col gap-2">
                            {Object.values(teams)
                                .filter(t => !t.disconnected)
                                .sort((a, b) => b.totalScore - a.totalScore)
                                .map(team => (
                                    <div key={team.id} className="flex justify-between items-center p-2 rounded bg-cyber-gray">
                                        <span className="font-sans font-semibold text-white text-sm sm:text-base">{team.name}</span>
                                        <span className="font-mono text-cyber-neonGreen text-base sm:text-lg">{team.totalScore}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-4 sm:gap-6">
                <QueueDisplay queue={queue} />

                <div className="bg-cyber-black p-4 sm:p-6 rounded-lg border border-gray-800 text-center">
                    <p className="text-gray-500 font-mono mb-2 text-xs sm:text-sm">TEAM JOIN LINK</p>
                    <div className="text-sm sm:text-lg font-bold text-white select-all bg-gray-900 p-2 sm:p-3 rounded font-mono break-all">
                        {window.location.origin}
                    </div>
                    <p className="text-gray-600 font-mono text-[10px] sm:text-xs mt-2">Share this URL with participants</p>
                </div>

                <div className="bg-cyber-black p-4 sm:p-6 rounded-lg border border-gray-800 text-center">
                    <p className="text-gray-500 font-mono mb-2 text-xs sm:text-sm">LEADERBOARD</p>
                    <a
                        href="/leaderboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyber-neonBlue font-mono hover:underline text-xs sm:text-sm break-all"
                    >
                        {window.location.origin}/leaderboard ↗
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HostDashboard;
