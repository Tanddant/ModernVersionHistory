import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import { SPFx, SPFI, spfi, IFileInfo } from "@pnp/sp/presets/all";
import { IField } from "../models/IField";
import { IVersion } from "../models/IVersion";
import { GetChanges } from "../models/FieldValues";
import { IVersionsFilter } from "../models/IVersionsFilter";

export interface IDataProvider {
    GetVersions(filters: IVersionsFilter): Promise<IVersion[]>
    GetFileInfo(): Promise<IFileInfo>;
}

export class DataProvider implements IDataProvider {
    private _context: ListViewCommandSetContext = null;
    private _SPFI: SPFI = null;

    constructor(context: ListViewCommandSetContext) {
        this._context = context;
    }

    private getSPFI(): SPFI {
        if (this._SPFI === null)
            this._SPFI = spfi().using(SPFx(this._context));
        return this._SPFI;
    }


    private fieldsToSkip: string[] = ["Modified", "Created"];
    public async GetVersions(filters: IVersionsFilter): Promise<IVersion[]> {
        const fields = await this.GetFields(this._context.pageContext.list.id.toString());

        const filterQueries: string[] = [];

        if (filters.StartDate !== undefined)
            filterQueries.push(`Created ge datetime'${filters.StartDate.toISOString()}'`);

        if (filters.EndDate !== undefined)
            filterQueries.push(`Created le datetime'${filters.EndDate.toISOString()}'`);

        if (filters.VersionNumbers !== undefined && filters.VersionNumbers.length > 0)
            filterQueries.push(`(${filters.VersionNumbers.map(v => `VersionId eq ${v}`).join(" or ")})`);

        const endpoint = this.getSPFI().web.lists.getById(this._context.pageContext.list.id.toString()).items.getById(this._context.listView.selectedRows[0].getValueByName("ID")).versions;

        if (filterQueries.length > 0)
            endpoint.filter(filterQueries.join(" and "));

        const versions = await endpoint();

        const Changes: IVersion[] = [];

        for (let i = versions.length; i > 0; i--) {
            const version = versions[i - 1];
            const prevVersion = versions[i] ?? {};

            const Version: IVersion = {
                VersionName: version.VersionLabel,
                Author: version.Editor,
                TimeStamp: new Date(version.Created),
                Changes: [],
                VersionId: version.VersionId
            };

            for (const field of fields) {
                if (this.fieldsToSkip.indexOf(field.StaticName) !== -1)
                    continue;

                const change = GetChanges(field, version, prevVersion);
                if (change !== undefined)
                    Version.Changes.push(change);
            }

            Changes.push(Version);
        }

        Changes.reverse();

        return Changes;
    }

    public async GetFileInfo(): Promise<IFileInfo> {
        const item = this.getSPFI().web.lists.getById(this._context.pageContext.list.id.toString()).items.getById(this._context.listView.selectedRows[0].getValueByName("ID"));
        return await item.file();
    }

    private async GetFields(listId: string): Promise<IField[]> {
        return this.getSPFI().web.lists.getById(listId).fields.filter("Hidden eq false")();
    }
}