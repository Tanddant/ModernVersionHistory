import * as React from 'react';
import { IVersion } from '../models/IVersion';
import { FieldUser } from './FieldUserPerson';
import { Icon, Text, TooltipHost, PersonaSize, Link, Checkbox, Stack, StackItem } from '@fluentui/react';
import { FieldType } from '../models/FieldTypes';
import { IFieldUrlValue, IFieldUserValue } from '../models/FieldValues';
import { ActionButton } from 'office-ui-fabric-react';
import { IDataProvider } from '../providers/DataProvider';

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
    
    return (
        <div style={{ display: "flex", padding: 10 }} className={props.className}>
            <Checkbox checked={props.selectedVersions.indexOf(Version.VersionId) > -1} onChange={(e, checked) => props.onVersionSelected()} />&nbsp;
            <FieldUser user={Version.Author} hidePersonaDetails />
            <div style={{ display: "flex", flexDirection: "column", marginLeft: "1em", flexGrow: 1 }}>
                <div>
                    <Icon iconName="EditContact" />&nbsp;
                    <Text variant='medium' styles={{ root: { fontWeight: "bold" } }}>Version: {Version.VersionName}</Text>
                    <ActionButton iconProps={{ iconName: "EntryView" }} text="View" href={Version.VersionLink} target="_blank" />
                    <ActionButton iconProps={{ iconName: "Delete" }} text="Delete" onClick={async () => {
                        await provider.DeleteVersion(Version.VersionId);
                        props.reloadVersions();
                    }} target="_blank" />
                    <ActionButton iconProps={{ iconName: "UpdateRestore" }} text="Restore" onClick={async () => {
                        await provider.RestoreVersion(Version);
                        props.reloadVersions();
                    }} target="_blank" />
                </div>
                <div>
                    {Version.Lifecycle &&
                        <Stack>
                            {Version.Lifecycle.ModerationStatus >= 0 &&
                                <StackItem>
                                    {Version.Lifecycle.ModerationStatus === 0 && <><Icon iconName="FileComment" style={{ color: 'darkgreen' }} title='Document approved' />&nbsp;Approved</>}
                                    {Version.Lifecycle.ModerationStatus === 1 && <><Icon iconName="FileComment" style={{ color: 'darkred' }} title='Document approval rejected' />&nbsp;Rejected</>}
                                    {Version.Lifecycle.ModerationStatus === 2 && <><Icon iconName="FileComment" title='Document approval pending' />&nbsp;Pending</>}
                                    {Version.Lifecycle.ModerationComments && <Text variant='medium'> &middot; {Version.Lifecycle.ModerationComments}</Text>}
                                </StackItem>
                            }
                            {Version.Lifecycle.CheckinComment &&
                                <StackItem>
                                    <Icon iconName="PageCheckedin" title='Document Status Information' />&nbsp;
                                    <Text variant='medium'>{Version.Lifecycle.CheckinComment}</Text>
                                </StackItem>
                            }
                        </Stack>
                    }
                </div>
                {Version.Changes.map((change) => {
                    switch (change.FieldType) {
                        case FieldType.User:
                            return <Text styles={{ root: { display: 'flex' } }}>{change.FieldName}:&nbsp;&nbsp;<FieldUser user={change.Data as IFieldUserValue} size={PersonaSize.size24} /></Text>
                        case FieldType.UserMulti:
                            return <Text styles={{ root: { display: 'flex' } }}>{change.FieldName}:&nbsp;&nbsp; {(change.Data as (IFieldUserValue[])).map(user => <FieldUser user={user} size={PersonaSize.size24} />)} </Text>
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

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text variant='small' styles={{ root: { backgroundColor: "lightgrey", borderRadius: 3, padding: "0.25em" } }}>{Version.Author.LookupValue}</Text>
                    <Text variant='small'>{Version.TimeStamp.toLocaleString()}</Text>
                </div>
            </div>
        </div>
    );
};