import { FieldType } from "./FieldTypes";
import { IFieldUserValue } from "./FieldValues";

export interface IChange {
    VersionName: string;
    Author: IFieldUserValue;
    TimeStamp: Date;
    Changes: IFieldChange[];
}

export interface IFieldChange {
    FieldName: string;
    FieldType: FieldType;
    OldValue: string;
    NewValue: string;
}