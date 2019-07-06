export type Address = string;

export interface StellarBaseResponse {
    address: string;
    ledger: number;
}

export interface AccountCreateResponse extends StellarBaseResponse {
    hash: string;
}
