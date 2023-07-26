import * as React from 'react';
import { PrimaryButton, Text } from '@fluentui/react';
import { IDataProvider } from '../providers/DataProvider';

export interface IBetterVersionHistoryProps {
  close: () => void;
  provider: IDataProvider;
}

export const BetterVersionHistory: React.FunctionComponent<IBetterVersionHistoryProps> = (props: React.PropsWithChildren<IBetterVersionHistoryProps>) => {
  return (
    <>
      <Text variant='large'>Hello world</Text>
      <PrimaryButton onClick={() => props.provider.GetVersions()}>TEST</PrimaryButton>
    </>
  );
};