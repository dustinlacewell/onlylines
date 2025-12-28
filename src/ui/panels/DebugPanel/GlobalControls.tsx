import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Slider, colors } from '../../design';
import { useEvolverStore } from '../../../storeReact';

const styles = {
  container: {
    padding: '8px 10px',
    paddingTop: '20px',
    borderBottom: `1px solid ${colors.borderDark}`,
    marginBottom: '8px',
    position: 'relative',
  } as React.CSSProperties,
  shareBtn: {
    position: 'absolute',
    top: '0px',
    right: '4px',
    background: 'none',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '9px',
    fontFamily: 'monospace',
  } as React.CSSProperties,
};

export function GlobalControls() {
  const lineCount = useEvolverStore((state) => state.lineCount);
  const fade = useEvolverStore((state) => state.fade);
  const speed = useEvolverStore((state) => state.speed);
  const setLineCount = useEvolverStore((state) => state.setLineCount);
  const setFade = useEvolverStore((state) => state.setFade);
  const setSpeed = useEvolverStore((state) => state.setSpeed);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div style={styles.container}>
      <button
        style={{ ...styles.shareBtn, color: copied ? colors.success : colors.textSecondary }}
        onClick={handleCopyUrl}
        title="Copy URL to clipboard"
        onMouseEnter={(e) => { if (!copied) e.currentTarget.style.color = colors.hover; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = copied ? colors.success : colors.textSecondary; }}
      >
        {copied ? <>Copied <Check size={10} /></> : <>Share <Share2 size={10} /></>}
      </button>
      <Slider
        label="Lines"
        value={lineCount}
        min={50}
        max={1500}
        step={10}
        onChange={setLineCount}
      />
      <Slider
        label="Feedback"
        value={1 - fade}
        min={0}
        max={0.99}
        step={0.01}
        onChange={(v) => setFade(1 - v)}
      />
      <Slider
        label="Speed"
        value={speed}
        min={0.1}
        max={3}
        step={0.1}
        onChange={setSpeed}
      />
    </div>
  );
}
