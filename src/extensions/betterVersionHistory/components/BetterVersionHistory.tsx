import * as React from 'react';
import { Spinner, SpinnerSize, Text } from '@fluentui/react';
import { IDataProvider } from '../providers/DataProvider';
import { IChange } from '../models/IChange';

export interface IBetterVersionHistoryProps {
  close: () => void;
  provider: IDataProvider;
}

export const BetterVersionHistory: React.FunctionComponent<IBetterVersionHistoryProps> = (props: React.PropsWithChildren<IBetterVersionHistoryProps>) => {
  const [versions, setVersions] = React.useState<IChange[]>(null);

  React.useEffect(() => {
    props.provider.GetVersions().then((versions) => {
      setVersions(versions);
    });
  }, []);

  if (versions === null) return (<Spinner label='Loading versions...' size={SpinnerSize.large} />);


  return (
    <>
      <Text variant='large'>Hello world</Text>
      {versions.map((version) => {
        return (
          <div>
            <Text variant='medium'>{version.VersionName}</Text>
            <ul>
              {version.Changes.map((change) => <li>{change.FieldName}: {change.OldValue} to {change.NewValue}</li>)}
            </ul>
          </div>
        )
      })}
    </>
  );
};