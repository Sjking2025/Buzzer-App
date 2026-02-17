import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QueueDisplay = ({ queue }) => {
  return (
    <div className="w-full max-w-md bg-cyber-dark p-4 rounded-lg border border-gray-800">
      <h3 className="text-xl text-cyber-neonBlue font-mono mb-4 border-b border-gray-700 pb-2">BUZZER QUEUE</h3>
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {queue.length === 0 && <p className="text-gray-500 italic text-center py-4">Waiting for buzzes...</p>}
          {queue.map((item, index) => (
            <motion.div
              key={item.teamId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex justify-between items-center p-3 rounded border ${
                index === 0 
                  ? 'bg-cyber-neonGreen/10 border-cyber-neonGreen text-cyber-neonGreen' 
                  : 'bg-cyber-gray border-gray-700 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-bold font-mono text-lg w-8 h-8 flex items-center justify-center rounded-full ${
                    index === 0 ? 'bg-cyber-neonGreen text-black' : 'bg-gray-700'
                }`}>
                  {index + 1}
                </span>
                <span className="font-sans font-semibold text-lg">{item.name}</span>
              </div>
              <div className="text-xs font-mono opacity-70">
                {index === 0 ? 'ACTIVE' : `+${(item.timestamp - queue[0].timestamp).toFixed(0)}ms`}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QueueDisplay;
