import { Service } from 'typedi';
import { StellarAccountManager } from '../../lib/stellar/StellarAccountManager';
import { IKeysStorage } from '../../lib/keys-storage/IStorage';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { VaultStorage } from '../../lib/keys-storage/VaultStorage';
import { StellarTxManager } from '../../lib/stellar/StellarTxManager';
import { TransferParams } from '../validators/ApiValidatorTransfer';
import { Decimal } from 'decimal.js';

import { Address, StellarBaseResponse } from '../../lib/stellar/StellarPatterns';
import { Keypair } from 'stellar-base';
import { CREDIT } from '../../lib/stellar/StellarConst';

@Service()
export class StellarOperationsService {

    private accountManager: StellarAccountManager;
    private storageManager: IKeysStorage;
    private txManager: StellarTxManager;

    constructor(@Logger(__filename) private log: LoggerInterface) {
        this.accountManager = new StellarAccountManager();
        this.storageManager = new VaultStorage();
        this.txManager = new StellarTxManager();
    }

    public async transferOperation(params: TransferParams): Promise<StellarBaseResponse[]> {
        const srcKeys: Keypair = await this.loadKeyPairs(params.sender_acc);
        const dstKeys: Keypair = await this.loadKeyPairs(params.receiver_acc);
        const profitKeys: Keypair = await this.loadKeyPairs(params.profit_acc);
        const result: StellarBaseResponse[] = [];

        await this.accountManager.checkEnoughBalance(srcKeys.publicKey(), params.asset + CREDIT, new Decimal(params.amount).plus(params.fee));

        result.push(await this.txManager.sendAsset(srcKeys, dstKeys, params.asset + CREDIT, params.amount.toString()));
        if (profitKeys && new Decimal(params.fee)) {
            result.push(await this.txManager.sendAsset(srcKeys, profitKeys, params.asset + CREDIT, params.fee.toString()));
        }

        this.log.info(`Transfer ${params.amount} ${params.asset} from ${srcKeys.publicKey()} to ${dstKeys.publicKey()}. Fee is ${params.fee} ${params.asset}`);
        return result;
    }

    private async loadKeyPairs(account: Address, pending: boolean = false): Promise<Keypair> | undefined {
        const keys = await this.storageManager.getAccountKeys(account);

        if (!account) {
            return undefined;
        }
        return pending ? StellarAccountManager.getKeyPair(keys.pending.secret) : StellarAccountManager.getKeyPair(keys.base.secret);
    }
}
