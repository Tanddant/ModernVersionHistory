import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import { SPFx, SPFI, spfi } from "@pnp/sp/presets/all";
import { IField } from "../models/IField";
import { IVersion } from "../models/IVersion";
import { DisplayFormat, FieldType } from "../models/FieldTypes";
import { IFieldLookupValue, IFieldUrlValue } from "../models/FieldValues";

export interface IDataProvider {
    GetVersions(): Promise<IVersion[]>
}

export class DataProvider implements IDataProvider {
    private _context: ListViewCommandSetContext;
    private _SPFI: SPFI;

    constructor(context: ListViewCommandSetContext) {
        this._context = context;
    }

    private getSPFI(): SPFI {
        if (this._SPFI == null)
            this._SPFI = spfi().using(SPFx(this._context));
        return this._SPFI;
    }

    private fieldsToSkip: string[] = ["Modified", "Created"];
    public async GetVersions(): Promise<IVersion[]> {
        const fields = await this.GetFields(this._context.pageContext.list.id.toString());
        console.log(fields);

        const versions = await this.getSPFI().web.lists.getById(this._context.pageContext.list.id.toString()).items.getById(this._context.listView.selectedRows[0].getValueByName("ID")).versions();

        let Changes: IVersion[] = [];

        let fieldsToHandle: string[] = [];
        for (let i = versions.length; i > 0; i--) {
            const version = versions[i - 1];
            const prevVersion = versions[i] ?? {};

            const Version: IVersion = {
                VersionName: version.VersionLabel,
                Author: version.Editor,
                TimeStamp: new Date(version.Created),
                Changes: []
            };

            for (let field of fields) {
                if (this.fieldsToSkip.indexOf(field.StaticName) != -1)
                    continue;

                switch (field.TypeAsString) {
                    case FieldType.Text:
                    case FieldType.Note:
                    case FieldType.Integer:
                    case FieldType.Number:
                    case FieldType.Choice:
                        if (version[field.StaticName] != prevVersion[field.StaticName]) {
                            Version.Changes.push({
                                FieldName: field.Title,
                                FieldInternalName: field.StaticName,
                                OldValue: prevVersion[field.StaticName],
                                NewValue: version[field.StaticName],
                                FieldType: field.TypeAsString
                            });
                        }
                        break;
                    case FieldType.Lookup:
                    case FieldType.User:
                        if ((version[field.StaticName] as IFieldLookupValue)?.LookupId != (prevVersion[field.StaticName] as IFieldLookupValue)?.LookupId) {
                            Version.Changes.push({
                                FieldName: field.Title,
                                FieldInternalName: field.StaticName,
                                OldValue: (prevVersion[field.StaticName] as IFieldLookupValue)?.LookupValue,
                                NewValue: (version[field.StaticName] as IFieldLookupValue)?.LookupValue,
                                FieldType: field.TypeAsString,
                                Data: version[field.StaticName]
                            });
                        }
                        break;
                    case FieldType.DateTime:
                        if (new Date(version[field.StaticName]).toLocaleString() != new Date(prevVersion[field.StaticName]).toLocaleString()) {
                            if (field.DisplayFormat == DisplayFormat.DateOnly) {
                                Version.Changes.push({
                                    FieldName: field.Title,
                                    FieldInternalName: field.StaticName,
                                    OldValue: new Date(prevVersion[field.StaticName]).toLocaleDateString(),
                                    NewValue: new Date(version[field.StaticName]).toLocaleDateString(),
                                    FieldType: field.TypeAsString
                                });
                            } else {
                                Version.Changes.push({
                                    FieldName: field.Title,
                                    FieldInternalName: field.StaticName,
                                    OldValue: new Date(prevVersion[field.StaticName]).toLocaleString(),
                                    NewValue: new Date(version[field.StaticName]).toLocaleString(),
                                    FieldType: field.TypeAsString
                                });
                            }
                        }
                        break;
                    case FieldType.UserMulti:
                    case FieldType.LookupMulti:
                        if (JSON.stringify(version[field.StaticName]) != JSON.stringify(prevVersion[field.StaticName])) {
                            Version.Changes.push({
                                FieldName: field.Title,
                                FieldInternalName: field.StaticName,
                                OldValue: (prevVersion[field.StaticName] as IFieldLookupValue[])?.map(x => x.LookupValue).join("\n"),
                                NewValue: (version[field.StaticName] as IFieldLookupValue[])?.map(x => x.LookupValue).join("\n"),
                                FieldType: field.TypeAsString,
                                Data: version[field.StaticName]
                            });
                        };
                        break;
                    case FieldType.MultiChoice:
                        if (JSON.stringify(version[field.StaticName]) != JSON.stringify(prevVersion[field.StaticName])) {
                            Version.Changes.push({
                                FieldName: field.Title,
                                FieldInternalName: field.StaticName,
                                OldValue: (prevVersion[field.StaticName] as string[])?.join("\n"),
                                NewValue: (version[field.StaticName] as string[])?.join("\n"),
                                FieldType: field.TypeAsString,
                                Data: version[field.StaticName]
                            });
                        };
                        break;
                    case FieldType.URL:
                        const BeforeUrlString = `${(prevVersion[field.StaticName] as IFieldUrlValue)?.Description} (${(prevVersion[field.StaticName] as IFieldUrlValue)?.Url})`;
                        const NewUrlString = `${(version[field.StaticName] as IFieldUrlValue).Description} (${(version[field.StaticName] as IFieldUrlValue).Url})`;
                        if (BeforeUrlString != NewUrlString) {
                            Version.Changes.push({
                                FieldName: field.Title,
                                FieldInternalName: field.StaticName,
                                OldValue: BeforeUrlString,
                                NewValue: NewUrlString,
                                FieldType: field.TypeAsString,
                                Data: version[field.StaticName]
                            });
                        }
                        break;

                    case FieldType.Boolean:
                        if (version[field.StaticName] != prevVersion[field.StaticName]) {
                            Version.Changes.push({
                                FieldName: field.Title,
                                FieldInternalName: field.StaticName,
                                OldValue: prevVersion[field.StaticName] ? "Yes" : "No",
                                NewValue: version[field.StaticName] ? "Yes" : "No",
                                FieldType: field.TypeAsString
                            });
                        }
                        break;
                    default:
                        if (fieldsToHandle.indexOf(field.TypeAsString) == -1)
                            fieldsToHandle.push(field.TypeAsString);
                }
            }

            Changes.push(Version);
        }

        Changes.reverse();

        console.log(fieldsToHandle);
        return Changes;
    }

    private async GetFields(listId: string): Promise<IField[]> {
        return this.getSPFI().web.lists.getById(listId).fields.filter("Hidden eq false")();
    }




}