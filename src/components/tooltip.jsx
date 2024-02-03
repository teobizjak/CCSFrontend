import React, { useState } from 'react';

const Tooltip = ({ content, children, placement = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  return (
    <div className="relative flex items-center" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      {isVisible && (
        <div className={`absolute p-2 text-xs text-white bg-black rounded-md ${placementClasses[placement]}`}>
          {content}
        </div>
      )}
    </div>
  );
};

const placementClasses = {
  top: '-top-10 left-1/2 transform -translate-x-1/2',
  bottom: 'top-10 left-1/2 transform -translate-x-1/2',
  left: '-left-10 top-1/2 transform -translate-y-1/2',
  right: 'right-10 top-1/2 transform -translate-y-1/2',
};

export default Tooltip;
