 export type Entry = {
    ID: number;
    TransactionID: number;
    Location: string;
    AccountID: number;
    Memo: string;
    Date: string;
    RegisterID: number;
    Void: boolean;
    Rec: boolean;
    ClassID?: number;
    Target: string;
    Description: string;
    PaymentMethod: string;
    ReferenceNumber: number;
    Amount: number;
    Class: string;
};