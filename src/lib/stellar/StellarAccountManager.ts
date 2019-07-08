import { StellarBaseManager } from './StellarBaseManager';
import { BadAddressError } from './StellarError';

export class StellarAccountManager extends StellarBaseManager {
    constructor() {
        super();
    }

    public async getBalances(address: string): Promise<any> {
        let account: any;
        try {
            account = await this.server.loadAccount(address);
        } catch (err) {
            throw new BadAddressError('TODO ADD EXCEPTION 1' + err);
        }
        return account.balances;
    }
}
