import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import { SPFx, SPFI, spfi } from "@pnp/sp/presets/all";
import { IField } from "../models/IField";
import { IChange } from "../models/IChange";
import { FieldType } from "../models/FieldTypes";
import { IFieldLookupValue } from "../models/FieldValues";

export interface IDataProvider {
    GetVersions(): Promise<any>;
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

    private fieldsToSkip: string[] = ["Modified","Created"];
    public async GetVersions(): Promise<any> {
        const fields = await this.GetFields(this._context.pageContext.list.id.toString());
        console.log(fields);

        const versions = await this.getSPFI().web.lists.getById(this._context.pageContext.list.id.toString()).items.getById(this._context.listView.selectedRows[0].getValueByName("ID")).versions();

        let Changes: IChange[] = [];

        let fieldsToHandle: string[] = [];
        for (let i = 0; i < versions.length; i++) {
            const version = versions[i];
            const prevVersion = versions[1 + 1];
            const Version: IChange = {
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
                    case FieldType.Boolean:
                    case FieldType.Choice:
                        if (version[field.StaticName] != prevVersion[field.StaticName]) {
                            Version.Changes.push({
                                FieldName: field.Title,
                                OldValue: prevVersion[field.StaticName],
                                NewValue: version[field.StaticName]
                            });
                        }
                        break;
                    case FieldType.Lookup:
                    case FieldType.User:
                        if ((version[field.StaticName] as IFieldLookupValue)?.LookupId != (prevVersion[field.StaticName] as IFieldLookupValue)?.LookupId) {
                            Version.Changes.push({
                                FieldName: field.Title,
                                OldValue: (prevVersion[field.StaticName] as IFieldLookupValue)?.LookupValue,
                                NewValue: (version[field.StaticName] as IFieldLookupValue)?.LookupValue
                            });
                        }
                        break;
                    case FieldType.DateTime:
                        if (new Date(version[field.StaticName]).toLocaleString() != new Date(prevVersion[field.StaticName]).toLocaleString()) {
                            Version.Changes.push({
                                FieldName: field.Title,
                                OldValue: new Date(prevVersion[field.StaticName]).toLocaleString(),
                                NewValue: new Date(version[field.StaticName]).toLocaleString(),
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

        console.log(fieldsToHandle);
        console.log(Changes);
        debugger;
        return versions;
    }

    private async GetFields(listId: string): Promise<IField[]> {
        return this.getSPFI().web.lists.getById(listId).fields.filter("Hidden eq false")();
    }




}