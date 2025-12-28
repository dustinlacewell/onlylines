import React, { useState, useRef, useEffect } from 'react';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const tooltipStyle: React.CSSProperties = {
  position: 'fixed',
  background: 'rgba(0, 0, 0, 0.95)',
  border: '1px solid var(--debug-text-accent)',
  color: 'var(--debug-text)',
  padding: '6px 10px',
  fontSize: '10px',
  borderRadius: '4px',
  maxWidth: '220px',
  lineHeight: 1.4,
  zIndex: 10000,
  pointerEvents: 'none',
};

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ctrlHeld, setCtrlHeld] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') setCtrlHeld(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        setCtrlHeld(false);
        setVisible(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (ctrlHeld) {
      setVisible(true);
      setPosition({ x: e.clientX + 12, y: e.clientY + 12 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (ctrlHeld && visible) {
      setPosition({ x: e.clientX + 12, y: e.clientY + 12 });
    } else if (ctrlHeld && !visible) {
      setVisible(true);
      setPosition({ x: e.clientX + 12, y: e.clientY + 12 });
    }
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'contents' }}
    >
      {children}
      {visible && content && (
        <div style={{ ...tooltipStyle, left: position.x, top: position.y }}>
          {content}
        </div>
      )}
    </div>
  );
}
