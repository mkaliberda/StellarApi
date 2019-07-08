import { Service } from 'typedi';

import { Logger, LoggerInterface } from '../../decorators/Logger';
import { IAccountKeys, IKeysStorage } from '../../lib/keys-storage/IStorage';
import { VaultStorage } from '../../lib/keys-storage/VaultStorage';
import { StellarAccountManager } from '../../lib/stellar/StellarAccountManager';
import { Address } from '../../lib/stellar/StellarPatterns';
import { StellarTxManager } from '../../lib/stellar/StellarTxManager';

@Service()
export class StellarService {

    constructor(
        @Logger(__filename) private log: LoggerInterface
    ) {}

    public getAccountBalance(account: Address,
                             assets: string[],
                             include_pending?: boolean): Promise<any> {
        const manager = new StellarAccountManager();
        this.log.info(`Get balance of user ${account}`);
        return manager.getBalances(account);
    }

    public async createWallet(assets: string[],
                              isUser: boolean = true,
                              balance?: number): Promise<object> {
        const manager = new StellarTxManager();
        const typeAsset = isUser ? 'c' : 'd';
        assets.forEach((item, index) => {
            assets[index] = item + typeAsset;
        });
        let newWallet: object;
        try {
            newWallet = await manager.createAndTrustAccount(assets, balance.toString());
            this.log.info(`Created new wallet ${newWallet}`);
        } catch (error) {
            // TODO ADD HANDLER LOGIC
            this.log.error(`Fail create Wallet in stellar , asset: ${assets}, isUser: ${isUser}`);
            throw new Error(error);
        }
        const storage = new VaultStorage();
        // try {

        // } catch (error) {
        //     // TODO ADD HANDLER LOGIC
        //     this.log.error(`Fail create new Wallet, asset: ${assets}, isUser: ${isUser}`);
        //     throw new Error(error);
        // }
        return newWallet;
    }
}
