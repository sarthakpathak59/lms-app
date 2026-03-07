import React from 'react';
import { LegendList as LegendListComponent } from '@legendapp/list';
import { FlatListProps } from 'react-native';

export function LegendList<T>(props: FlatListProps<T>) {
  const List = LegendListComponent as any;
  return (
    <List {...props} recycleItems />
  );
}
