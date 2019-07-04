
export interface StellarBaseResponse {
    address: string;
    ledger: BigInt;
}

export interface AccountCreateResponse extends StellarBaseResponse {
    hash: string;
}
