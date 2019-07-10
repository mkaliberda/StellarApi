import { Service } from 'typedi';

import { Logger, LoggerInterface } from '../../decorators/Logger';
import { toBool } from '../../lib/env';
import { IAccountKeys, IKeyPair, IKeysStorage } from '../../lib/keys-storage/IStorage';
import { VaultStorage } from '../../lib/keys-storage/VaultStorage';
import { StellarAccountManager } from '../../lib/stellar/StellarAccountManager';
import { CREDIT, DEBIT } from '../../lib/stellar/StellarConst';
import { Address } from '../../lib/stellar/StellarPatterns';
import { StellarTxManager } from '../../lib/stellar/StellarTxManager';
import { BalanceParams } from '../validators/ApiValidatorBalance';

export interface IBalance {
    asset: string;
    balance: string;
}

export interface IAccountBalances {
    credit: IBalance[];
    debit: IBalance[];
}

export interface IAccountBalancesGroup {
    base?: IAccountBalances;
    pending?: IAccountBalances;
}

@Service()
export class StellarService {

    private static _filteredByAssetsBalances(balances: any, assets: string[]): IAccountBalances {
        const result: IAccountBalances = {credit: [], debit: []};

        for (const item of balances) {
            if (!item.asset_code) { // Skip `item` if it's native asset (XLM).
                continue;
            }
            const assetCode = item.asset_code.slice(0, -1);
            const assetSuffix = item.asset_code.slice(-1);

            if (assets.includes(assetCode)) {
                if (assetSuffix === CREDIT) {
                    result.credit.push({asset: assetCode, balance: item.balance});
                } else if (assetSuffix === DEBIT) {
                    result.debit.push({asset: assetCode, balance: item.balance});
                }
            }
        }
        return result;
    }

    constructor(@Logger(__filename) private log: LoggerInterface,
                private accountManager: StellarAccountManager = new StellarAccountManager(),
                private storageManager: IKeysStorage = new VaultStorage(),
                private txManager: StellarTxManager = new StellarTxManager()) {
    }

    public async getAccountBalance(account: Address, options: BalanceParams): Promise<IAccountBalancesGroup> {
        const keys: IAccountKeys = await this.storageManager.getAccountKeys(account);
        console.log('keys', keys);
        const balances = await this.accountManager.getBalances(keys.base.address);
        const result: IAccountBalancesGroup = {};

        if (toBool(options.include_pending)) {
            const pendingBalances = await this.accountManager.getBalances(keys.pending.address);

            result.pending = options.assets ?
                StellarService._filteredByAssetsBalances(pendingBalances, options.assets) :
                pendingBalances;
        }

        result.base = options.assets ?
            StellarService._filteredByAssetsBalances(balances, options.assets) :
            balances;

        this.log.info(`Get balance of user ${account}`);
        return result;
    }

    public async createWallet(assets: string[],
                              isUser: boolean = true,
                              balance: number): Promise<Address> {
        const typeAsset = isUser ? CREDIT : DEBIT;
        assets.forEach((item, index) => {
            assets[index] = item + typeAsset;
        });
        const newWalletMain: IKeyPair = await this.txManager.createAndTrustAccount(assets, balance.toString());
        const newWalletPending: IKeyPair = await this.txManager.createAndTrustAccount(assets, balance.toString());
        await this.storageManager.saveAccountKeys(newWalletMain.address, {base: newWalletMain, pending: newWalletPending });
        this.log.info(`Created new wallet ${ newWalletMain } ${ newWalletPending }`);
        return newWalletMain.address;
    }

    public async createInternalWallet(assets: string[],
                                      walletName: string,
                                      balance: number): Promise<Address> {
        const newWalletMain: IKeyPair = await this.txManager.createAndTrustAccount(assets, balance.toString());
        const newWalletPending: IKeyPair = await this.txManager.createAndTrustAccount(assets, balance.toString());
        this.storageManager.saveAccountKeys(walletName, {base: newWalletMain, pending: newWalletPending });
        this.log.info(`Created new internal wallet ${ newWalletMain } ${ newWalletPending }`);
        return newWalletMain.address;
}
}
