export type EntryFormData = {
    TransactionID: number;
    Location: string;
    AccountID: number;
    Memo: string;
    Date: string;
    Void: boolean;
    Rec?: boolean;
    EntryType: string;
    ClassID: number;
    Target: string;
    Description: string;
    PaymentMethod: string;
    ReferenceNumber: number;
    Amount: number;
    Class: string;
};
