import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import BuzzerButton from '../components/BuzzerButton';

const TeamBuzzer = () => {
  const [enabled, setEnabled] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [active, setActive] = useState(false);
  const [standbyRank, setStandbyRank] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const teamName = location.state?.teamName;

  useEffect(() => {
    if (!teamName) {
      navigate('/');
      return;
    }

    if (!socket.connected) {
       socket.connect();
       socket.emit('join-team', { teamName });
    }

    const onBuzzerStatus = ({ enabled }) => {
        setEnabled(enabled);
        if (enabled) {
            setPressed(false);
            setActive(false);
            setStandbyRank(null);
        }
    };

    const onQueueUpdate = (queue) => {
        const myRankIndex = queue.findIndex(item => item.name === teamName);
        if (myRankIndex === 0) {
            setActive(true);
            setStandbyRank(null);
            setPressed(true); 
        } else if (myRankIndex > 0) {
            setActive(false);
            setStandbyRank(myRankIndex + 1);
            setPressed(true);
        }
    };
    
    const onGameReset = () => {
        setEnabled(false);
        setPressed(false);
        setActive(false);
        setStandbyRank(null);
    };

    socket.on('buzzer-status', onBuzzerStatus);
    socket.on('queue-update', onQueueUpdate);
    socket.on('game-reset', onGameReset);

    // Initial state check? Maybe ask server.

    return () => {
        socket.off('buzzer-status', onBuzzerStatus);
        socket.off('queue-update', onQueueUpdate);
        socket.off('game-reset', onGameReset);
    };
  }, [teamName, navigate]);

  const handleBuzz = () => {
    if (enabled && !pressed) {
        setPressed(true);
        // Use performance.now() for high-res client timing? Server time is authoritative.
        // We just send buzz.
        socket.emit('buzzer-press', { clientTimestamp: Date.now() });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${
        active ? 'bg-cyber-neonGreen/10' : standbyRank ? 'bg-cyber-neonYellow/10' : 'bg-cyber-black'
    }`}>
        <div className="absolute top-4 left-4 font-mono text-gray-500">
            TEAM: <span className="text-white font-bold">{teamName}</span>
        </div>

        <BuzzerButton 
            enabled={enabled} 
            active={active} 
            pressed={pressed} 
            onBuzz={handleBuzz} 
        />

        {standbyRank && (
            <div className="mt-8 p-4 bg-yellow-900/30 border border-yellow-600 rounded text-yellow-500 text-2xl font-mono font-bold animate-pulse">
                STANDBY RANK: #{standbyRank}
            </div>
        )}
    </div>
  );
};

export default TeamBuzzer;
