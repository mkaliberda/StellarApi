import { StellarBaseManager } from './StellarBaseManager';
import { BadAddressError } from './StellarError';
import { Decimal } from 'decimal.js';

const asyncForEach = async (array: any, callback: any) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
};

export class StellarAccountManager extends StellarBaseManager {
    constructor() {
        super();
    }

    public async getBalances(address: string): Promise<any> {
        let account: any;
        try {
            account = await this.server.loadAccount(address);
        } catch (err) {
            console.log('koqenrvpnweirnvwnpeiruv', err);
            throw new BadAddressError('TODO ADD EXCEPTION 1' + err);
        }
        return account.balances;
    }

    public async getHistory(address: string): Promise<any> {
        let account: any;
        // console.log('address', address);
        const tx = await this.server.operations().forAccount(address).limit('100').call();
        const response = tx.records.map((item, index) => {
            console.log('-----------');
            console.log(item);
            console.log('-----------');
        });
        // for (let item in tx.records) {
        //     console.log('-----');
        //     console.log(tx.records[item]);
        //     console.log('-----');
        // }
        // tx.then((page) => {
        //     console.log('Page 1: ', page);
        //     console.log(page.records);
        // });
        // .catch((err) => {
        //     console.log(err);
        // });
        // try {w
        //     account = await this.server.loadAccount(address);
        // } catch (err) {
        //     console.log('koqenrvpnweirnvwnpeiruv', err);
        //     throw new BadAddressError('TODO ADD EXCEPTION 1' + err);
        // }
        // return account.balances;
    }

    public async checkEnoughBalance(address: string, asset: string, amount: Decimal): Promise<void> {
        const balances = await this.getBalances(address);
        const assetBalanceObj = balances.find(item => {
            return item.asset_code && item.asset_code === asset;
        });
        if (typeof assetBalanceObj === 'undefined') {
            // No trustline error
            throw new Error(`Asset '${asset}' not found in '${address}' trustlines.`);
        } else if (new Decimal(assetBalanceObj.balance).lessThan(amount)) {
            // Balance error
            throw new Error(`Account ${address} balance ${assetBalanceObj.balance} of ${asset} is less than ${amount}`);
        }
    }
}
