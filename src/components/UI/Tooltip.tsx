import React from 'react';

interface TooltipProps {
  content: string;
  x: number;
  y: number;
  visible: boolean;
}

export const Tooltip: React.FC<TooltipProps> = React.memo(({ content, x, y, visible }) => {
  if (!visible) return null;

  return (
    <div 
      className="tooltip"
      style={{
        position: 'absolute',
        left: x + 20, // Fixed offset from seat
        top: y - 40,  // Fixed offset above seat
        zIndex: 1000,
        pointerEvents: 'none',
        // Remove all transitions that could cause movement
        transition: 'none'
      }}
    >
      <div className="tooltip-inner bg-dark text-white p-2 rounded shadow">
        {content}
      </div>
    </div>
  );
});

Tooltip.displayName = 'Tooltip';