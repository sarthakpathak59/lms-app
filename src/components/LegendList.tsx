import React from 'react';
import { FlatList, FlatListProps } from 'react-native';

const getLegendListComponent = (): React.ComponentType<any> | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require('@legendapp/list');
    return module.LegendList ?? null;
  } catch {
    return null;
  }
};

// Uses @legendapp/list when available; falls back to FlatList in restricted envs.
export function LegendList<T>(props: FlatListProps<T>) {
  const LegendListComponent = getLegendListComponent();

  if (LegendListComponent) {
    return (
      <LegendListComponent {...props} recycleItems />
    );
  }

  return <FlatList {...props} removeClippedSubviews windowSize={7} />;
}
