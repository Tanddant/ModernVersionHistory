import * as React from 'react';
import { CommandBar, DatePicker, DialogContent, Spinner, SpinnerSize, Stack } from '@fluentui/react';
import { Version } from './Version';
import styles from './BetterVersionHistory.module.scss';
import useVersions from '../hooks/useVersion';
import { IVersionsFilter } from '../models/IVersionsFilter';
import useObject from '../hooks/useObject';
import useFileInfo from '../hooks/useFileInfo';
import { PeoplePicker } from './PeoplePicker';
import { IDataProvider } from '../models/IDataProvider';

export interface IBetterVersionHistoryProps {
  provider: IDataProvider;
}

export const BetterVersionHistory: React.FunctionComponent<IBetterVersionHistoryProps> = (props: React.PropsWithChildren<IBetterVersionHistoryProps>) => {
  const [filters, setFilters] = useObject<IVersionsFilter>({});
  const { versions, isLoading: isLoadingVersions } = useVersions(props.provider, filters)
  const { fileInfo } = useFileInfo(props.provider);
  const [selectedVersions, setSelectedVersions] = React.useState<number[]>([]);


  if (isLoadingVersions) return (<Spinner label='Loading versions...' size={SpinnerSize.large} />);
  return (
    <DialogContent styles={{ content: { maxHeight: "50vh", width: "50vw", overflowY: "scroll" } }} title={fileInfo?.Name ?? 'Better version history'}>
      <CommandBar
        items={[
          {
            key: "ShowSelectedVersions",
            text: 'Show for selected items',
            disabled: selectedVersions.length === 0,
            iconProps: { iconName: 'BranchCompare' },
            onClick: () => { setFilters({ VersionNumbers: selectedVersions }) }
          }, {
            key: "ClearSelectedVersions",
            text: "Clear selection",
            disabled: selectedVersions.length === 0,
            iconProps: { iconName: 'Clear' },
            onClick: () => { setSelectedVersions([]); setFilters({ VersionNumbers: [] }) }
          }
        ]}
      />
      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <DatePicker label='Start date' value={filters.StartDate} onSelectDate={date => setFilters({ StartDate: date })} styles={{ root: { flexGrow: 1 } }} />
        <DatePicker label='End date' value={filters.EndDate} onSelectDate={date => setFilters({ EndDate: date })} styles={{ root: { flexGrow: 1 } }} />
        <Stack styles={{ root: { flexGrow: 1 } }}>
          <PeoplePicker versions={versions} onContributorSelected={(userPersonaProps) => setFilters({ Author: userPersonaProps })} />
        </Stack>
      </Stack>

      <Stack>
        {versions.map((version) => <Version
          Version={version}
          className={styles.test}
          selectedVersions={selectedVersions}
          onVersionSelected={() => {
            if (selectedVersions.indexOf(version.VersionId) > -1) {
              setSelectedVersions(selectedVersions.filter(v => v !== version.VersionId));
            } else {
              setSelectedVersions([...selectedVersions, version.VersionId]);
            }
          }}
          provider={props.provider}
          reloadVersions={() => { setFilters({}) }}
        />)}
      </Stack>

    </DialogContent>
  );
};