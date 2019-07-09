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
import { CREDIT, DEBIT, SYSTEM_ACCOUNTS } from '../../lib/stellar/StellarConst';
import { DepositWithdrawParams } from '../validators/ApiValidatorDepositWithdraw';

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

        result.push(await this.txManager.sendAsset(
            srcKeys,
            dstKeys,
            params.asset + CREDIT,
            params.amount.toString()
        ));
        if (profitKeys && new Decimal(params.fee)) {
            result.push(await this.txManager.sendAsset(
                srcKeys,
                profitKeys,
                params.asset + CREDIT,
                params.fee.toString()
            ));
        }

        this.log.info(
            `Transfer ${params.amount} ${params.asset} from
             ${srcKeys.publicKey()} to ${dstKeys.publicKey()}. Fee is ${params.fee} ${params.asset}`
        );
        return result;
    }

    public async depositOperation(params: DepositWithdrawParams): Promise<StellarBaseResponse[]> {
        const usrKeys: Keypair = await this.loadKeyPairs(params.user_acc);
        const serviceKeys: Keypair = await this.loadKeyPairs(params.service_acc);
        const profitKeys: Keypair = await this.loadKeyPairs(params.profit_acc);
        const rsKeys: Keypair = await this.loadKeyPairs(SYSTEM_ACCOUNTS.RS_MAIN);
        const result: StellarBaseResponse[] = [];

        await this.accountManager.checkEnoughBalance(rsKeys.publicKey(), params.asset + CREDIT, new Decimal(params.amount));
        await this.accountManager.checkEnoughBalance(rsKeys.publicKey(), params.asset + DEBIT, new Decimal(params.amount));

        result.push(await this.txManager.sendAsset(
            rsKeys, usrKeys,
            params.asset + CREDIT,
            new Decimal(params.amount).minus(params.fee).toString()
        ));

        if (profitKeys && new Decimal(params.fee)) {
            result.push(await this.txManager.sendAsset(
                rsKeys, profitKeys,
                params.asset + CREDIT,
                params.fee.toString()
            ));
        }

        result.push(await this.txManager.sendAsset(
            rsKeys, serviceKeys,
            params.asset + DEBIT,
            params.amount.toString()
        ));

        this.log.info(
            `Deposit ${params.amount} ${params.asset} to user ${usrKeys.publicKey()} and
            service ${serviceKeys.publicKey()}. Fee is ${params.fee} ${params.asset}`
        );
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
