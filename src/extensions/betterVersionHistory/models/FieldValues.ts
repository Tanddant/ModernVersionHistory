export interface IFieldLookupValue {
    LookupId: number;
    LookupValue: string;
}

export interface IFieldUserValue extends IFieldLookupValue {
    Email: string;
}

export interface IFieldUrlValue {
    Description: string;
    Url: string;
}

export interface ITaxonomyFieldValue {
    Label: string
    TermGuid: string
    WssId: number
  }
  