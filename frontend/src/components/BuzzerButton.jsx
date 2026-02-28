import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const BuzzerButton = ({ enabled, active, onBuzz, pressed }) => {
  // Determine button state for styling (priority: active > pressed-standby > enabled > locked)
  const getButtonClass = () => {
    if (active) return "bg-cyber-neonBlue border-cyber-neonBlue text-cyber-black animate-pulse cursor-not-allowed";
    if (pressed) return "bg-cyber-neonYellow border-cyber-neonYellow text-cyber-black cursor-not-allowed";
    if (enabled) return "bg-cyber-neonGreen text-cyber-black border-cyber-neonGreen cursor-pointer";
    return "bg-cyber-gray text-gray-500 border-gray-600 cursor-not-allowed";
  };

  const getGlow = () => {
    if (active) return "0 0 50px #00ccff, 0 0 100px #00ccff55";
    if (enabled && !pressed) return "0 0 30px #00ff9d";
    return "0 0 0px #000";
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.button
        whileHover={enabled && !pressed ? { scale: 1.05 } : {}}
        whileTap={enabled && !pressed ? { scale: 0.95 } : {}}
        animate={{ boxShadow: getGlow() }}
        onClick={onBuzz}
        disabled={!enabled || pressed}
        className={clsx(
          "w-64 h-64 rounded-full border-8 text-4xl font-bold tracking-widest transition-all duration-300 flex items-center justify-center",
          getButtonClass()
        )}
      >
        {active ? "ACTIVE" : pressed ? "WAITING" : enabled ? "BUZZ!" : "LOCKED"}
      </motion.button>

      <div className="mt-8 text-center">
        {active && <p className="text-2xl text-cyber-neonBlue font-mono animate-bounce">GO! SPEAK NOW!</p>}
        {pressed && !active && <p className="text-xl text-cyber-neonYellow font-mono">You buzzed! Standby...</p>}
        {enabled && !pressed && <p className="text-xl text-cyber-neonGreen font-mono">READY TO BUZZ</p>}
        {!enabled && !pressed && <p className="text-xl text-gray-500 font-mono">Wait for host...</p>}
      </div>
    </div>
  );
};

export default BuzzerButton;
