import { CircleHelp } from 'lucide-react';
import { useUIStore } from '../uiStore';
import { colors } from './design';

const buttonStyle: React.CSSProperties = {
  background: colors.bgPanelOuter,
  border: `1px solid ${colors.borderDark}`,
  borderRadius: '4px',
  color: colors.accent,
  cursor: 'pointer',
  padding: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
        e.currentTarget.style.color = colors.textPrimary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = colors.accent;
      }}
      title="Show welcome"
    >
      <CircleHelp size={14} />
    </button>
  );
}
