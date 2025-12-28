import React from 'react';
import { Button } from '../../design';
import { useEvolverStore } from '../../../storeReact';

const styles = {
  container: {
    display: 'flex',
    gap: '6px',
    marginTop: '12px',
  } as React.CSSProperties,
  button: {
    flex: 1,
  } as React.CSSProperties,
};

export function ActionButtons() {
  const buildConfig = useEvolverStore((state) => state.buildConfig);
  const state = useEvolverStore();

  const handleLog = () => {
    console.log('Store State:', state);
    console.log('Built Config:', buildConfig());
  };

  return (
    <div style={styles.container}>
      <Button onClick={handleLog} style={styles.button}>
        Log State
      </Button>
    </div>
  );
}
