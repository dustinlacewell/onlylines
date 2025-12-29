import { CircleHelp } from 'lucide-react';
import { useUIStore } from '../uiStore';
import { colors } from './design';

const buttonStyle: React.CSSProperties = {
  position: 'fixed',
  top: '12px',
  right: '12px',
  background: colors.bgInput,
  border: `1px solid ${colors.borderLight}`,
  color: colors.textSecondary,
  cursor: 'pointer',
  padding: '5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  borderRadius: '3px',
};

export function HelpButton() {
  const hasSeenWelcome = useUIStore((state) => state.hasSeenWelcome);

  const handleClick = () => {
    useUIStore.setState({ hasSeenWelcome: false });
  };

  if (!hasSeenWelcome) {
    return null;
  }

  return (
    <button
      style={buttonStyle}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.bgHover;
        e.currentTarget.style.color = colors.textPrimary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = colors.bgInput;
        e.currentTarget.style.color = colors.textSecondary;
      }}
      title="Show welcome"
    >
      <CircleHelp size={14} />
    </button>
  );
}
