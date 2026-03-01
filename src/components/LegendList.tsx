import React from 'react';
import { FlatList, FlatListProps } from 'react-native';

// Wrapper to keep the list API stable while retaining optimized FlatList behavior.
export function LegendList<T>(props: FlatListProps<T>) {
  return <FlatList {...props} removeClippedSubviews windowSize={7} />;
}
