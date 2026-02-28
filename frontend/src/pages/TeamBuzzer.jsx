import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import BuzzerButton from '../components/BuzzerButton';
import { WifiOff } from 'lucide-react';

const TeamBuzzer = () => {
  const [enabled, setEnabled] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [active, setActive] = useState(false);
  const [standbyRank, setStandbyRank] = useState(null);
  const [connected, setConnected] = useState(socket.connected);

  const location = useLocation();
  const navigate = useNavigate();
  const teamName = location.state?.teamName;

  useEffect(() => {
    if (!teamName) {
      navigate('/');
      return;
    }

    // Join team once connected — fixes the race condition where
    // join-team was emitted before the socket finished connecting
    const onConnect = () => {
      setConnected(true);
      socket.emit('join-team', { teamName });
    };

    const onDisconnect = () => setConnected(false);

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
      } else {
        // Not in queue anymore (passed/reset)
        setActive(false);
        setStandbyRank(null);
      }
    };

    const onGameReset = () => {
      setEnabled(false);
      setPressed(false);
      setActive(false);
      setStandbyRank(null);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('buzzer-status', onBuzzerStatus);
    socket.on('queue-update', onQueueUpdate);
    socket.on('game-reset', onGameReset);

    // Connect — if already connected, manually fire join-team now
    if (!socket.connected) {
      socket.connect();
    } else {
      setConnected(true);
      socket.emit('join-team', { teamName });
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('buzzer-status', onBuzzerStatus);
      socket.off('queue-update', onQueueUpdate);
      socket.off('game-reset', onGameReset);
    };
  }, [teamName, navigate]);

  const handleBuzz = () => {
    if (enabled && !pressed) {
      setPressed(true);
      socket.emit('buzzer-press', { clientTimestamp: Date.now() });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${
      active ? 'bg-cyber-neonGreen/10' : standbyRank ? 'bg-cyber-neonYellow/10' : 'bg-cyber-black'
    }`}>
      {/* Team label */}
      <div className="absolute top-16 left-4 font-mono text-gray-500">
        TEAM: <span className="text-white font-bold">{teamName}</span>
      </div>

      {/* Connection status banner */}
      {!connected && (
        <div className="absolute top-16 right-4 flex items-center gap-2 bg-red-900/80 border border-red-500 text-red-400 px-3 py-1 rounded font-mono text-xs animate-pulse">
          <WifiOff size={12} /> CONNECTING...
        </div>
      )}

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
