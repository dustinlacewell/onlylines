import { createRoot } from 'react-dom/client';
import { DebugPanel } from './panels/DebugPanel';

let root: ReturnType<typeof createRoot> | null = null;

export function mountDebugPanel(): void {
  // Create container if it doesn't exist
  let container = document.getElementById('debug-panel-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'debug-panel-root';
    document.body.appendChild(container);
  }

  // Mount React
  if (!root) {
    root = createRoot(container);
  }

  root.render(<DebugPanel />);
}

export function unmountDebugPanel(): void {
  if (root) {
    root.unmount();
    root = null;
  }

  const container = document.getElementById('debug-panel-root');
  if (container) {
    container.remove();
  }
}

export function isSystemDebugMode(): boolean {
  return window.location.search.includes('system');
}
