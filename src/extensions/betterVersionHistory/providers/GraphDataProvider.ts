import { IFileInfo } from "@pnp/sp/files";
import { IDataProvider } from "../models/IDataProvider";
import { IVersion } from "../models/IVersion";
import { IVersionsFilter } from "../models/IVersionsFilter";
import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import { MSGraphClientV3 } from '@microsoft/sp-http';

export default class GraphDataProvider implements IDataProvider {

  private _context: ListViewCommandSetContext = null;

  constructor(context: ListViewCommandSetContext) {
    this._context = context;
  }

  private get GraphClient(): Promise<MSGraphClientV3> {
    return this._context.msGraphClientFactory
      .getClient('3');
  }

  public async GetVersions(filters: IVersionsFilter): Promise<IVersion[]> {
    throw new Error("Method not implemented.");
  }

  public async GetFileInfo(): Promise<IFileInfo> {
    throw new Error("Method not implemented.");
  }

}