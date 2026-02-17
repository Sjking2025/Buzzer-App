import React, { useEffect, useState } from 'react';
import { socket } from '../socket';
import QueueDisplay from '../components/QueueDisplay';
import { Trophy, Mic, ShieldAlert, SkipForward, CheckCircle, XCircle } from 'lucide-react';

const HostDashboard = () => {
    const [buzzerEnabled, setBuzzerEnabled] = useState(false);
    const [queue, setQueue] = useState([]);
    const [activeTeam, setActiveTeam] = useState(null);

    useEffect(() => {
        if (!socket.connected) socket.connect();

        const onQueueUpdate = (q) => {
            setQueue(q);
            if (q.length > 0) setActiveTeam(q[0]);
            else setActiveTeam(null);
        };

        const onBuzzerStatus = ({ enabled }) => setBuzzerEnabled(enabled);

        socket.on('queue-update', onQueueUpdate);
        socket.on('buzzer-status', onBuzzerStatus);

        return () => {
            socket.off('queue-update', onQueueUpdate);
            socket.off('buzzer-status', onBuzzerStatus);
        };
    }, []);

    const enableBuzzer = () => socket.emit('host-enable-buzzer');
    const disableBuzzer = () => socket.emit('host-disable-buzzer');
    const resetBuzzer = () => socket.emit('host-reset-buzzer');
    
    const handleCorrect = () => socket.emit('host-correct-answer', { points: 10 });
    const handlePass = () => socket.emit('host-pass-answer');

    return (
        <div className="min-h-screen bg-cyber-dark text-white p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
                <div className="bg-cyber-black p-6 rounded-lg border border-gray-800 shadow-lg">
                    <h2 className="text-2xl font-mono text-cyber-neonBlue mb-4 flex items-center gap-2">
                        <Mic /> GAME CONTROL
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <button 
                            onClick={enableBuzzer}
                            disabled={buzzerEnabled}
                            className={`p-4 rounded font-bold text-xl transition-all ${
                                buzzerEnabled ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-cyber-neonGreen text-black hover:bg-green-400'
                            }`}
                        >
                            ENABLE BUZZER
                        </button>
                        <button 
                            onClick={disableBuzzer}
                            disabled={!buzzerEnabled}
                            className={`p-4 rounded font-bold text-xl transition-all ${
                                !buzzerEnabled ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-cyber-neonRed text-black hover:bg-red-500'
                            }`}
                        >
                            DISABLE BUZZER
                        </button>
                    </div>
                    
                    <button 
                        onClick={resetBuzzer}
                        className="w-full p-3 rounded border border-gray-600 hover:bg-gray-800 text-gray-400 hover:text-white transition-all font-mono"
                    >
                        RESET ROUND / NEXT QUESTION
                    </button>
                </div>

                {activeTeam && (
                    <div className="bg-cyber-black p-6 rounded-lg border border-cyber-neonBlue shadow-[0_0_15px_rgba(0,204,255,0.2)]">
                        <h2 className="text-xl font-mono text-gray-400 mb-2">ACTIVE ANSWER</h2>
                        <div className="text-4xl font-bold text-white mb-6">{activeTeam.name}</div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={handleCorrect}
                                className="flex items-center justify-center gap-2 bg-green-900/50 border border-green-500 text-green-400 p-4 rounded hover:bg-green-900 transition-all font-bold"
                            >
                                <CheckCircle /> CORRECT (+10)
                            </button>
                            <button 
                                onClick={handlePass}
                                className="flex items-center justify-center gap-2 bg-red-900/50 border border-red-500 text-red-400 p-4 rounded hover:bg-red-900 transition-all font-bold"
                            >
                                <XCircle /> WRONG / PASS
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-6">
                <QueueDisplay queue={queue} />
                
                <div className="bg-cyber-black p-6 rounded-lg border border-gray-800 text-center">
                    <p className="text-gray-500 font-mono mb-2">Invite Teams</p>
                    <div className="text-2xl font-bold text-white select-all bg-gray-900 p-2 rounded">
                        http://{window.location.hostname}:5173
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostDashboard;
