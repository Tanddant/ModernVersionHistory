import * as React from 'react';
import { IVersion } from '../models/IVersion';
import { FieldUser } from './FieldUserPerson';
import { Icon, Text, TooltipHost, PersonaSize, Link, Checkbox, Stack, StackItem, DefaultButton, IContextualMenuProps } from '@fluentui/react';
import { FieldType } from '../models/FieldTypes';
import { IFieldUrlValue, IFieldUserValue } from '../models/FieldValues';
import { useConst } from '@fluentui/react-hooks';
import { IDataProvider } from '../providers/DataProvider';
import { IFileInfo } from '@pnp/sp/files';
import styles from './BetterVersionHistory.module.scss';

export interface IVersionProps {
    Version: IVersion;
    className: string;
    selectedVersions?: number[];
    onVersionSelected?: () => void;
    provider: IDataProvider;
    reloadVersions: () => void;
}

export const Version: React.FunctionComponent<IVersionProps> = (props: React.PropsWithChildren<IVersionProps>) => {
    const { Version, provider } = props;

    const [versionMetadata, setVersionMetadata] = React.useState<IFileInfo>(undefined);
    React.useMemo(() => {
        getMetadata();
    }, []);

    async function getMetadata() {
        const { FileRef, VersionId } = props.Version;
        const metadata = await props.provider.GetFileVersionMetadata(FileRef, VersionId);
        setVersionMetadata(metadata);
    }

    const menuProps = useConst<IContextualMenuProps>(() => ({
        shouldFocusOnMount: true,
        items: [
            {
                key: 'version-view',
                text: 'View version',
                iconProps: { iconName: 'EntryView' },
                href: `${Version.VersionLink}`,
                target: '_blank'
            },
            {
                key: 'version-delete',
                text: 'Delete version',
                iconProps: { iconName: 'Delete' },
                onClick: () => {
                    console.log('delete');
                    async () => {
                        await provider.DeleteVersion(Version.VersionId);
                        console.log('deleted');
                        props.reloadVersions();
                    }
                },
                target: '_blank'
            },
            {
                key: 'version-restore',
                text: 'Restore version',
                iconProps: { iconName: 'UpdateRestore' },
                onClick: () => {
                    async () => {
                        await provider.RestoreVersion(Version);
                        props.reloadVersions();
                    }
                },
                target: '_blank'
            },
        ],
    }));

    return (
        <Stack tokens={{ childrenGap: 10 }} horizontal verticalAlign='start'>
            <StackItem
                style={{ paddingTop: '3px' }}
                children={<Checkbox checked={props.selectedVersions.indexOf(Version.VersionId) > -1} onChange={(e, checked) => props.onVersionSelected()} />} />
            <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <Stack tokens={{ childrenGap: 15 }} horizontal styles={{ root: { paddingBottom: '10px' } }} verticalAlign='center'>
                    <StackItem>
                        <DefaultButton className={styles.version} text={`Version ${Version.VersionName}`} menuProps={menuProps} />
                    </StackItem>
                    {Version.Moderation &&
                        <StackItem grow={2}>
                            {Version.Moderation.ModerationStatus == 0 && <><Icon iconName="FileComment" style={{ color: 'darkgreen' }} title='Document approved' />&nbsp;Approved</>}
                            {Version.Moderation.ModerationStatus == 1 && <><Icon iconName="FileComment" style={{ color: 'darkred' }} title='Document approval rejected' />&nbsp;Rejected</>}
                            {Version.Moderation.ModerationStatus == 2 && <><Icon iconName="FileComment" title='Document approval pending' />&nbsp;Pending</>}
                            {Version.Moderation.ModerationComments && <Text variant='small'> &middot; {Version.Moderation.ModerationComments}</Text>}
                        </StackItem>
                    }
                    <StackItem grow={1} style={{ textAlign: 'right', lineHeight: '1em' }}>
                        <Text variant='small'>{Version.Author.LookupValue}</Text><br />
                        <Text variant='small'>{Version.TimeStamp.toLocaleString()}</Text>
                    </StackItem>
                </Stack>
                <div>
                    {Version.Moderation &&
                        <Stack>
                            {versionMetadata?.CheckInComment &&
                                <StackItem styles={{ root: { backgroundColor: "lightgrey", borderRadius: 3, padding: "0.25em", width: '100%' } }}>
                                    <Icon iconName="PageCheckedin" title='Document Status Information' />&nbsp;
                                    <Text variant='medium'>{versionMetadata.CheckInComment}</Text>
                                </StackItem>
                            }
                        </Stack>
                    }
                </div>
                {Version.Changes && Version.Changes.map((change) => {
                    switch (change.FieldType) {
                        case FieldType.User:
                            return <Text styles={{ root: { display: 'flex' } }}>{change.FieldName}:&nbsp;&nbsp;<FieldUser user={change.Data as IFieldUserValue} size={PersonaSize.size8} /></Text>
                        case FieldType.UserMulti:
                            return <Text styles={{ root: { display: 'flex' } }}>{change.FieldName}:&nbsp;&nbsp; {(change.Data as (IFieldUserValue[]) ?? []).map(user => <FieldUser user={user} size={PersonaSize.size8} />)} </Text>
                        case FieldType.URL: {
                            const link = change.Data as IFieldUrlValue;
                            return <Text>{change.FieldName}: <Link href={link.Url} target='_blank'>{link.Description}</Link></Text>
                        }
                        case FieldType.Lookup:
                            return <Text>{change.FieldName}: <Link href={change.Link} target='_blank'>{change.NewValue}</Link></Text>
                        default:
                            return <Text>{change.FieldName}: <TooltipHost content={change.OldValue}>{change.NewValue}</TooltipHost></Text>
                    }
                })}
            </div>
        </Stack>
    );
};