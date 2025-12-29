import { Tabs, type Tab } from '../../design';
import { Header } from './Header';
import { GlobalControls } from './GlobalControls';
import { ActionButtons } from './ActionButtons';
import { ShapeTab, MotionTab } from './tabs';
import { EvolverSlot } from '../EvolverSlot';
import { baseStyles } from '../../design';
import { useUIStore } from '../../../uiStore';
import { WelcomeModal } from '../../WelcomeModal';
import { HelpButton } from '../../HelpButton';

const tabs: Tab[] = [
  { id: 'shape', label: 'Shape' },
  { id: 'motion', label: 'Motion' },
  { id: 'color', label: 'Color' },
  { id: 'alpha', label: 'Alpha' },
  { id: 'lineWidth', label: 'Width' },
  { id: 'dash', label: 'Dash' },
];

const panelStyles = `
  ${baseStyles}

  .debug-panel-container {
    position: fixed;
    top: 10px;
    left: 10px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    z-index: 1000;
  }
`;

export function DebugPanel() {
  const isPanelCollapsed = useUIStore((state) => state.isPanelCollapsed);
  const togglePanelCollapsed = useUIStore((state) => state.togglePanelCollapsed);
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'shape':
        return <ShapeTab />;
      case 'motion':
        return <MotionTab />;
      case 'color':
        return <EvolverSlot slot="color" title="Color" />;
      case 'alpha':
        return <EvolverSlot slot="alpha" title="Alpha" />;
      case 'lineWidth':
        return <EvolverSlot slot="lineWidth" title="Line Width" />;
      case 'dash':
        return <EvolverSlot slot="dash" title="Dash" />;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{panelStyles}</style>
      <WelcomeModal />
      <div className="debug-panel-container">
        <div className={`debug-panel ${isPanelCollapsed ? 'collapsed' : ''}`}>
          <Header
            title="SYSTEM DEBUG"
            collapsed={isPanelCollapsed}
            onToggleCollapse={togglePanelCollapsed}
          />
          {!isPanelCollapsed && (
            <div className="debug-body">
              <GlobalControls />
              <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
              {renderTabContent()}
              <ActionButtons />
            </div>
          )}
        </div>
        <HelpButton />
      </div>
    </>
  );
}

export { Header } from './Header';
export { ActionButtons } from './ActionButtons';
