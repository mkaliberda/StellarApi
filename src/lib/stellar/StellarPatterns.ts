export type Address = string;

export interface StellarBaseResponse {
    hash: string;
    ledger: number;
}

export interface TxHistoryResponse {
    id: string;
    success: string;
    tx_hash: string;
    created_at: string;
    memo_type: string;
    source_account: string;
    operations: object[];
}
