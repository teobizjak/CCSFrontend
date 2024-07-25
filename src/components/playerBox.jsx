import React from 'react';
import UserTitleBox from './userTitleBox';

function PlayerBox({ player, className, onClick, onlyHover = false }) {
  const tierClasses = {
    0: 'text-gray-400',        // Light Gray
    1: 'text-bronze',      // Deep Bronze
    2: 'text-silver',      // Bright Silver
    3: 'text-gold',          // Bright Gold
    4: 'text-emerald',    // Emerald
    5: 'text-diamond',          // Vibrant Ruby
    6: 'text-ruby',    // Diamond Text
    7: 'gradient-text'   // Gradient Text
  };

  const hoverClasses = {
    1: 'text-bronze-hover',   
    2: 'text-silver-hover',   
    3: 'text-gold-hover',     
    4: 'text-emerald-hover',  
    5: 'text-diamond-hover',     
    6: 'text-ruby-hover',  
    7: 'gradient-text-hover'  
  };

  const tierClass = tierClasses[player.tier] || '';
  const hoverClass = hoverClasses[player.tier] || '';

  return (
    <span
      className={`${className} ${tierClass} ${hoverClass} relative group ${player.tier ? 'font-bold' : ''}`}
      onClick={onClick}
    >
      {player.firstName || player.lastName
        ? `${player.firstName || ''} ${player.lastName || ''}`.trim()
        : player.walletAddress && player.walletAddress.slice(0, 8) + '...'}
      <span className={`absolute ${onlyHover ? 'invisible group-hover:visible' : ''}`}>
        <UserTitleBox user={player} tier={player.tier} />
      </span>
    </span>
  );
}

export default PlayerBox;
