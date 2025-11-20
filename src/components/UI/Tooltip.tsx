import React from 'react';

interface TooltipProps {
  content: string;
  x: number;
  y: number;
  visible: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, x, y, visible }) => {
  if (!visible) return null;

  return (
    <div 
      className="tooltip fade show"
      style={{
        position: 'absolute',
        left: x + 10,
        top: y - 10,
        zIndex: 1000,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="tooltip-inner bg-dark text-white p-2 rounded shadow">
        {content}
      </div>
    </div>
  );
};