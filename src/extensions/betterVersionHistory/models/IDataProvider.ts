import { IFileInfo } from "@pnp/sp/files";
import { IVersion } from "./IVersion";
import { IVersionsFilter } from "./IVersionsFilter";

export interface IDataProvider {
  GetVersions(filters: IVersionsFilter): Promise<IVersion[]>
  GetFileInfo(): Promise<IFileInfo>;
}
