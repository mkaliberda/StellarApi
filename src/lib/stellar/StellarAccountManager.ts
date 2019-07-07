import { StellarBaseManager } from './StellarBaseManager';

export class StellarAccountManager extends StellarBaseManager {
    constructor() {
        super();
    }

    public async getBalances(address: string): Promise<any> {
        let account: any;
        try {
            account = await this.server.loadAccount(address);
        } catch (err) {
            console.log('Get balance error', err);
            throw new Error('TODO ADD EXCEPTION 1' + err);
        }
        return account.balances;
    }
}
