import React from 'react';

const ScoreTable = ({ teams, rounds }) => {
  const sortedTeams = Object.values(teams).sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-cyber-neonBlue/30 text-cyber-neonBlue font-mono uppercase tracking-wider text-xs sm:text-sm">
            <th className="p-2 sm:p-4 text-center w-14 sm:w-20">Rank</th>
            <th className="p-2 sm:p-4">Team</th>
            <th className="p-2 sm:p-4 text-center">Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedTeams.map((team, index) => (
            <tr key={team.id} className="border-b border-gray-800 hover:bg-cyber-gray/50 transition-colors bg-opacity-50">
               <td className="p-2 sm:p-4 text-center text-lg sm:text-xl">
                 {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
               </td>
               <td className="p-2 sm:p-4 font-bold text-base sm:text-xl">{team.name}</td>
               <td className="p-2 sm:p-4 text-center font-mono text-lg sm:text-2xl text-cyber-neonGreen glow-text">
                 {team.totalScore}
               </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScoreTable;
