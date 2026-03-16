 export type Entry = {
    ID: number;
    TransactionID: number;
    Location: string;
    Memo: string;
    Date: string;
    RegisterID: number;
    Void: boolean;
    Rec: boolean;
    EntryType: string;
    FundIDs: number[];
};