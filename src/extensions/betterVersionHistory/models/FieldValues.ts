export interface IFieldLookupValue {
    LookupId: number;
    LookupValue: string;
}

export interface IFieldUserValue extends IFieldLookupValue {
    Email: string;
}