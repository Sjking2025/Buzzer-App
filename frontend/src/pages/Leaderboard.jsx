import React, { useEffect, useState } from 'react';
import { socket } from '../socket';
import ScoreTable from '../components/ScoreTable';

const Leaderboard = () => {
    const [teams, setTeams] = useState({});

    useEffect(() => {
        if (!socket.connected) socket.connect();

        const onGameUpdate = (gameState) => {
            if (gameState && gameState.teams) {
                setTeams(gameState.teams);
            }
        };

        const onScoreUpdate = (updatedTeams) => {
            setTeams(updatedTeams);
        };
        
        socket.on('game-update', onGameUpdate);
        socket.on('score-update', onScoreUpdate);

        return () => {
             socket.off('game-update', onGameUpdate);
             socket.off('score-update', onScoreUpdate);
        };
    }, []);

    return (
        <div className="min-h-screen bg-cyber-black text-white p-4 sm:p-8 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-neonGreen via-cyber-neonBlue to-cyber-neonRed animate-pulse"></div>
            <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-cyber-neonBlue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <header className="mb-6 sm:mb-12 flex justify-between items-end border-b border-gray-800 pb-4 sm:pb-6 relative z-10">
                <div>
                    <h1 className="text-3xl sm:text-6xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        LEADERBOARD
                    </h1>
                    <p className="text-cyber-neonGreen font-mono mt-1 sm:mt-2 tracking-widest uppercase text-xs sm:text-base">CSE Symposium 2026</p>
                </div>
                <div className="text-right">
                   <div className="text-lg sm:text-2xl font-mono animate-pulse text-cyber-neonRed">LIVE</div>
                </div>
            </header>

            <main className="relative z-10">
                <ScoreTable teams={teams} />
            </main>
        </div>
    );
};

export default Leaderboard;
