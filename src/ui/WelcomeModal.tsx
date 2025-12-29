import { useEffect, useState } from 'react';
import { marked } from 'marked';
import { useUIStore } from '../uiStore';
import { colors } from './design';
import welcomeContent from './welcome.md?raw';

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  cursor: 'pointer',
};

const modalStyle: React.CSSProperties = {
  background: colors.bgPanel,
  border: `1px solid ${colors.borderLight}`,
  borderRadius: '8px',
  padding: '24px 32px',
  maxWidth: '500px',
  maxHeight: '80vh',
  overflow: 'auto',
  cursor: 'default',
  fontFamily: 'monospace',
  fontSize: '13px',
  lineHeight: '1.6',
  color: colors.textValue,
};

const contentStyles = `
  .welcome-content h1 {
    color: ${colors.textPrimary};
    font-size: 18px;
    margin: 0 0 16px 0;
    border-bottom: 1px solid ${colors.borderDark};
    padding-bottom: 8px;
  }
  .welcome-content h2 {
    color: ${colors.textPrimary};
    font-size: 14px;
    margin: 16px 0 8px 0;
  }
  .welcome-content p {
    margin: 8px 0;
  }
  .welcome-content strong {
    color: ${colors.accent};
  }
  .welcome-content em {
    color: ${colors.textSecondary};
    font-style: italic;
  }
  .welcome-content ul {
    margin: 8px 0;
    padding-left: 20px;
  }
  .welcome-content li {
    margin: 4px 0;
  }
`;

export function WelcomeModal() {
  const hasSeenWelcome = useUIStore((state) => state.hasSeenWelcome);
  const dismissWelcome = useUIStore((state) => state.dismissWelcome);
  const [html, setHtml] = useState('');

  useEffect(() => {
    const parsed = marked.parse(welcomeContent);
    if (typeof parsed === 'string') {
      setHtml(parsed);
    } else {
      parsed.then(setHtml);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !hasSeenWelcome) {
        dismissWelcome();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSeenWelcome, dismissWelcome]);

  if (hasSeenWelcome) {
    return null;
  }

  return (
    <>
      <style>{contentStyles}</style>
      <div style={overlayStyle} onClick={dismissWelcome}>
        <div
          style={modalStyle}
          onClick={(e) => e.stopPropagation()}
          className="welcome-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </>
  );
}
