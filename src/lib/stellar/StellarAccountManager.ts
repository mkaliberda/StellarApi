import { StellarBaseManager } from './StellarBaseManager';
import { BadAddressError } from './StellarError';
import { Decimal } from 'decimal.js';

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

    public async getHistory(address: string, limit: number, page: number): Promise<any> {
        if (limit > 200) {
            throw new Error('200 its Max value for limit');
        }
        // console.log('address', address);
        const account = await this.server.loadAccount(address);
        let tx = await account.operations({limit});
        if (page === 1) {
            return this.historyToResponse(tx.records);
        }
        for (let index = 0; index < page - 2; index++) {
            tx = await tx.next();
            console.log('page index!!!', page, index);
        }
        // let tx;
        // try {
        //     tx = await this.server.operations().forAccount(address).limit('200').call();
        // } catch (err) {
        //     console.log('koqenrvpnweirnvwnpeiruv', err);
        //     // throw new BadAddressError('TODO ADD EXCEPTION 1' + err);
        // }

        // // console.log('tx==============!', tx);
        // const response = tx.records.map((item, index) => {
        //     console.log('-----------');
        //     console.log(index);
        //     console.log('-----------');
        // });
        // const next_resp = await tx.next();
        // const response1 = next_resp.records.map((item, index) => {
        //     // if (item.type !== 'create_account') {
        //     console.log('-----------');
        //     console.log(index);
        //     console.log('-----------');
        //     // }
        // });
        // const next1_resp = await next_resp.next();
        // console.log('next1_resp', next1_resp);
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

    private historyToResponse(records: any): any {
        return records.map((item, index) => {
            return {
                id: item.id,
                success: item.transaction_successful,
                source_account: item.source_account,
                created_at: item.created_at,
                transaction_hash: item.transaction_hash,
            };
        });
    }
}

// : '5155846245851137',
//           paging_token: '5155846245851137',
//           transaction_successful: true,
//           source_account: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
//           type: 'create_account',
//           type_i: 0,
//           created_at: '2019-07-08T10:04:06Z',
//           transaction_hash: '7c3ebab589961bc5da060c72d4ccd50ba979bf6d562684733f782deccff3fb9c',
//           starting_balance: '10000.0000000',
//           funder: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
//           account: 'GDKGMU2QL6RILIAQV4BKB5AYQSOUJQL5FHXEQ5JWZAQT3TWTNRAQ7VR7',
//           self: [Function],
//           transaction: [Function],
//           effects: [Function],
//           succeeds: [Function],
//           precedes: [Function] },