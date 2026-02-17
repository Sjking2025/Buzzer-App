import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

const Home = () => {
    const [teamName, setTeamName] = useState('');
    const navigate = useNavigate();

    const handleJoin = (e) => {
        e.preventDefault();
        if (teamName.trim()) {
            socket.auth = { teamName };
            socket.connect(); // Connect manually
            socket.emit('join-team', { teamName });
            navigate('/buzzer', { state: { teamName } });
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyber-neonGreen to-cyber-neonBlue animate-pulse">
                BUZZER.IO
            </h1>
            
            <form onSubmit={handleJoin} className="w-full max-w-sm bg-cyber-dark p-8 rounded-xl border border-gray-800 shadow-[0_0_20px_rgba(0,255,157,0.1)]">
                <div className="mb-6">
                    <label className="block text-cyber-neonGreen font-mono mb-2">TEAM NAME</label>
                    <input 
                        type="text" 
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full bg-cyber-black border border-gray-700 p-3 rounded text-white focus:border-cyber-neonGreen focus:outline-none focus:shadow-[0_0_10px_#00ff9d] transition-all"
                        placeholder="Enter your team name..."
                        autoFocus
                    />
                </div>
                <button 
                    type="submit"
                    className="w-full bg-cyber-neonGreen text-cyber-black font-bold py-3 rounded hover:bg-green-400 transform hover:scale-105 transition-all text-xl font-mono"
                >
                    JOIN GAME
                </button>
            </form>
            
            <div className="mt-8 text-gray-500 font-mono text-sm">
                v1.0.0 • CSE SYMPOSIUM
            </div>
        </div>
    );
};

export default Home;
