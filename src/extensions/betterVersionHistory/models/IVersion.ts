import { FieldType } from "./FieldTypes";
import { IFieldUserValue } from "./FieldValues";

export interface IVersion {
    VersionName: string;
    Author: IFieldUserValue;
    TimeStamp: Date;
    Changes: IFieldChange[];
}

export interface IFieldChange {
    FieldName: string;
    FieldInternalName: string;
    FieldType: FieldType;
    OldValue: string;
    NewValue: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Data?: any;
    Link?: string;
}