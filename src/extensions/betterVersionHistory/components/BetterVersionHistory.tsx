import * as React from 'react';
import { DialogContent, Spinner, SpinnerSize, Stack } from '@fluentui/react';
import { IDataProvider } from '../providers/DataProvider';
import { IVersion } from '../models/IVersion';
import { Version } from './Version';
import styles from './BetterVersionHistory.module.scss';

export interface IBetterVersionHistoryProps {
  close: () => void;
  provider: IDataProvider;
}

export const BetterVersionHistory: React.FunctionComponent<IBetterVersionHistoryProps> = (props: React.PropsWithChildren<IBetterVersionHistoryProps>) => {
  const [versions, setVersions] = React.useState<IVersion[] | null>(null);

  React.useEffect(() => {
    props.provider.GetVersions().then((versions) => {
      setVersions(versions);
    });
  }, []);

  if (versions === null) return (<Spinner label='Loading versions...' size={SpinnerSize.large} />);

  return (
    <DialogContent styles={{ content: { maxHeight: "50vh", maxWidth: 800, overflowY: "scroll" } }} title={"Better version history"}>
      <Stack>
        {versions.map((version) => <Version Version={version} className={styles.test} />)}
      </Stack>
    </DialogContent>
  );
};