import * as React from 'react';
import { Text } from '@fluentui/react';

export interface IBetterVersionHistoryProps {
  close: () => void;
}

export const BetterVersionHistory: React.FunctionComponent<IBetterVersionHistoryProps> = (props: React.PropsWithChildren<IBetterVersionHistoryProps>) => {
  return (
    <>
      <Text variant='large'>Hello world</Text>
    </>
  );
};