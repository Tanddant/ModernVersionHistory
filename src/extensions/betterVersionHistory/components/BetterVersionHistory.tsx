import * as React from 'react';
import { DatePicker, DialogContent, Spinner, SpinnerSize, Stack } from '@fluentui/react';
import { IDataProvider } from '../providers/DataProvider';
import { Version } from './Version';
import styles from './BetterVersionHistory.module.scss';
import useVersions from '../hooks/useVersion';
import { IVersionsFilter } from '../models/IVersionsFilter';
import useObject from '../hooks/useObject';
import useFileInfo from '../hooks/useFileInfo';

export interface IBetterVersionHistoryProps {
  provider: IDataProvider;
}

export const BetterVersionHistory: React.FunctionComponent<IBetterVersionHistoryProps> = (props: React.PropsWithChildren<IBetterVersionHistoryProps>) => {
  const [filters, setFilters] = useObject<IVersionsFilter>({});
  const { versions, isLoading: isLoadingVersions } = useVersions(props.provider, filters)
  const { fileInfo } = useFileInfo(props.provider);

  if (isLoadingVersions) return (<Spinner label='Loading versions...' size={SpinnerSize.large} />);
  return (
    <DialogContent styles={{ content: { maxHeight: "50vh", width: "50vw", overflowY: "scroll" } }} title={fileInfo?.Name ?? 'Better version history'}>
      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <DatePicker label='Start date' value={filters.StartDate} onSelectDate={date => setFilters({ StartDate: date })} styles={{ root: { flexGrow: 1 } }} />
        <DatePicker label='End date' value={filters.EndDate} onSelectDate={date => setFilters({ EndDate: date })} styles={{ root: { flexGrow: 1 } }} />
      </Stack>
      <Stack>
        {versions.map((version) => <Version Version={version} className={styles.test} />)}
      </Stack>
    </DialogContent>
  );
};