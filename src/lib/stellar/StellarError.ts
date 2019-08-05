import { HttpError } from 'routing-controllers';
import { Address } from './StellarPatterns';

class StellarError extends HttpError {
    constructor(message: string) {
        super(400, message);
        this.name = 'StellarError';
    }
}

// tslint:disable-next-line: max-classes-per-file
export class BalanceError extends StellarError {
    constructor(address: Address, asset: string, amount: number) {
        super(`Account ${address} balance ${amount} of ${asset} is less than ${amount}`);
    }
}

// tslint:disable-next-line: max-classes-per-file
export class BadAddressError extends StellarError {
    constructor(address: Address) {
        super(`Bad address: ${address}`);
    }
}

// tslint:disable-next-line: max-classes-per-file
export class BadSeqError extends StellarError {
    constructor() {
        super(`Bad sequence. Transaction failed.`);
    }
}

// tslint:disable-next-line: max-classes-per-file
export class NoTrustlineError extends StellarError {
    constructor(address: string, asset: string) {
        super(`No trustline for asset: ${asset} founded in acc: ${address}`);
    }
}
