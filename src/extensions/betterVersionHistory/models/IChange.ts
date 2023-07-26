import { IFieldUserValue } from "./FieldValues";

export interface IChange {
    VersionName: string;
    Author: IFieldUserValue;
    TimeStamp: Date;
    Changes: IFieldChange[];
}

export interface IFieldChange {
    FieldName: string;
    OldValue: string;
    NewValue: string;
}