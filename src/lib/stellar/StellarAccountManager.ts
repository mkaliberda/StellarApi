import { Decimal } from 'decimal.js';

import { StellarBaseManager } from './StellarBaseManager';
import { BadAddressError, BalanceError, NoTrustlineError } from './StellarError';
import { Address, TxHistoryResponse } from './StellarPatterns';

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

    public async getTxHistory(address: string, limit: number, page: number): Promise<TxHistoryResponse[]> {
        if (limit > 200) {
            throw new Error('200 its Max value for limit');
        }
        let tx = await this.server.transactions().forAccount(address).limit(limit.toString()).call();
        if (page !== 1) {
            for (let index = 0; index < page - 1; index++) {
                tx = await tx.next();
            }
        }
        return await this.historyToResponse(tx.records);
    }

    public async checkEnoughBalance(address: string, asset: Address, amount: Decimal = new Decimal(0)): Promise<void> {
        const balances = await this.getBalances(address);
        const assetBalanceObj = balances.find(item => {
            return item.asset_code && item.asset_code === asset;
        });
        if (typeof assetBalanceObj === 'undefined') {
            // No trustline error
            throw new NoTrustlineError(address, asset);
        } else if (new Decimal(assetBalanceObj.balance).lessThan(amount)) {
            // Balance error
            throw new BalanceError(address, asset, assetBalanceObj.balance);
        }
    }

    private async getOperationsFromTx(tx: any): Promise<any> {
        /* know operation types:
            change_trust
            create_account
            payment
        */
        const operations = await tx.operations();
        return operations.records.map((operation: any) => {
            delete(operation._links);
            delete(operation.self);
            delete(operation.transaction);
            delete(operation.effects);
            delete(operation.succeeds);
            delete(operation.precedes);
            return operation;
        });
    }

    private async historyToResponse(records: any): Promise<any> {
        return await Promise.all(records.map(async (tx: any) => {
            const operations = await this.getOperationsFromTx(tx);
            return {
                id: tx.id,
                success: tx.successful,
                tx_hash: tx.hash,
                created_at: tx.created_at,
                memo_type: tx.memo_type,
                source_account: tx.source_account,
                operations,
            };
        }));
    }
}
