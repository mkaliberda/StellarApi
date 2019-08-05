import { Decimal } from 'decimal.js';
import { Keypair } from 'stellar-base';
import { Service } from 'typedi';

import { Logger, LoggerInterface } from '../../decorators/Logger';
import { IKeysStorage } from '../../lib/keys-storage/IStorage';
import { VaultStorage } from '../../lib/keys-storage/VaultStorage';
import { StellarAccountManager } from '../../lib/stellar/StellarAccountManager';
import { CREDIT, DEBIT, SYSTEM_ACCOUNTS } from '../../lib/stellar/StellarConst';
import { Address, StellarBaseResponse } from '../../lib/stellar/StellarPatterns';
import { StellarTxManager } from '../../lib/stellar/StellarTxManager';
import asyncForEach from '../../lib/utils/AsyncForEach';
import { CreateAssetParams } from '../validators/ApiValidatorCreateAsset';
import { DepositWithdrawParams } from '../validators/ApiValidatorDepositWithdraw';
import { ExchangeParams } from '../validators/ApiValidatorExchange';
import { HoldParams } from '../validators/ApiValidatorHold';
import { TransferParams } from '../validators/ApiValidatorTransfer';

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
        const profitKeys: Keypair = params.profit_acc ? await this.loadKeyPairs(params.profit_acc) : undefined;
        const result: StellarBaseResponse[] = [];
        const fee = profitKeys && params.fee ? params.fee : 0;

        await Promise.all([
            this.accountManager.checkEnoughBalance(srcKeys.publicKey(), params.asset + CREDIT, new Decimal(params.amount).plus(fee)),
            this.accountManager.checkEnoughBalance(dstKeys.publicKey(), params.asset + CREDIT),
        ]);

        result.push(await this.txManager.sendAsset(
            srcKeys,
            dstKeys,
            params.asset + CREDIT,
            params.amount.toString()
        ));
        if (profitKeys && fee) {
            result.push(await this.txManager.sendAsset(
                srcKeys,
                profitKeys,
                params.asset + CREDIT,
                fee.toString()
            ));
        }

        this.log.info(
            `Transfer ${params.amount} ${params.asset} from
             ${srcKeys.publicKey()} to ${dstKeys.publicKey()}. Fee is ${fee} ${params.asset}`
        );
        return result;
    }

    public async depositOperation(params: DepositWithdrawParams): Promise<StellarBaseResponse[]> {
        const usrKeys: Keypair = await this.loadKeyPairs(params.user_acc);
        const serviceKeys: Keypair = await this.loadKeyPairs(params.service_acc);
        const profitKeys: Keypair = params.profit_acc ? await this.loadKeyPairs(params.profit_acc) : undefined;
        const rsKeys: Keypair = await this.loadKeyPairs(SYSTEM_ACCOUNTS.RS_MAIN);
        const fee = profitKeys && params.fee ? params.fee : 0;
        const result: StellarBaseResponse[] = [];
        console.log(
            usrKeys,
            serviceKeys,
            profitKeys,
            rsKeys,
            fee,
            result
        );
        await Promise.all([
            this.accountManager.checkEnoughBalance(rsKeys.publicKey(), params.asset + CREDIT, new Decimal(params.amount)),
            this.accountManager.checkEnoughBalance(rsKeys.publicKey(), params.asset + DEBIT, new Decimal(params.amount)),
            this.accountManager.checkEnoughBalance(usrKeys.publicKey(), params.asset + CREDIT),
            this.accountManager.checkEnoughBalance(serviceKeys.publicKey(), params.asset + DEBIT),
        ]);
        if (profitKeys) {
            this.accountManager.checkEnoughBalance(profitKeys.publicKey(), params.asset + CREDIT);
        }
        result.push(await this.txManager.sendAsset(
            rsKeys, usrKeys,
            params.asset + CREDIT,
            new Decimal(params.amount).minus(fee).toString()
        ));

        if (profitKeys && fee) {
            result.push(await this.txManager.sendAsset(
                rsKeys, profitKeys,
                params.asset + CREDIT,
                fee.toString()
            ));
        }

        result.push(await this.txManager.sendAsset(
            rsKeys, serviceKeys,
            params.asset + DEBIT,
            params.amount.toString()
        ));
        // return 'ADdress';

        this.log.info(
            `Deposit ${params.amount} ${params.asset} to user ${usrKeys.publicKey()} and
            service ${serviceKeys.publicKey()}. Fee is ${fee} ${params.asset}`
        );
        return result;
    }

    public async holdOperation(account: string, params: HoldParams): Promise<StellarBaseResponse[]> {
        const srcKeys: Keypair = await this.loadKeyPairs(account, params.reverse);  // Little trick with reverse: if reverse=false then srcKeys is base acc
        const dstKeys: Keypair = await this.loadKeyPairs(account, !params.reverse); // else if reverse=true srcKeys is pending.
        const result: StellarBaseResponse[] = [];

        await Promise.all([
            this.accountManager.checkEnoughBalance(srcKeys.publicKey(), params.asset + CREDIT, new Decimal(params.amount)),
            this.accountManager.checkEnoughBalance(dstKeys.publicKey(), params.asset + CREDIT),
        ]);

        result.push(await this.txManager.sendAsset(
            srcKeys, dstKeys,
            params.asset + CREDIT,
            params.amount.toString()
        ));

        return result;
    }

    public async withdrawOperation(params: DepositWithdrawParams): Promise<StellarBaseResponse[]> {
        const usrKeys: Keypair = await this.loadKeyPairs(params.user_acc, true);
        const serviceKeys: Keypair = await this.loadKeyPairs(params.service_acc);
        const profitKeys: Keypair = params.profit_acc ? await this.loadKeyPairs(params.profit_acc) : undefined;
        const rsKeys: Keypair = await this.loadKeyPairs(SYSTEM_ACCOUNTS.RS_MAIN);
        const result: StellarBaseResponse[] = [];
        const fee = profitKeys && params.fee ? params.fee : 0;
        console.log('FIRST!!!!!!!!!');
        await Promise.all([
            this.accountManager.checkEnoughBalance(usrKeys.publicKey(), params.asset + CREDIT, new Decimal(params.amount)),
            this.accountManager.checkEnoughBalance(serviceKeys.publicKey(), params.asset + DEBIT, new Decimal(params.amount)),
        ]);
        console.log('SECOND!!!!!!!!!');
        result.push(await this.txManager.sendAsset(
            usrKeys, rsKeys,
            params.asset + CREDIT,
            new Decimal(params.amount).minus(fee).toString()
        ));
        console.log('3!!!!!!!!!');
        if (profitKeys && fee) {
            result.push(await this.txManager.sendAsset(
                usrKeys, profitKeys,
                params.asset + CREDIT,
                fee.toString()
            ));
        }

        result.push(await this.txManager.sendAsset(
            serviceKeys, rsKeys,
            params.asset + DEBIT,
            new Decimal(params.amount).minus(fee).toString()
        ));

        return result;
    }

    public async exchangeOperation(params: ExchangeParams): Promise<StellarBaseResponse[]> {
        const fromKeys: Keypair = await this.loadKeyPairs(params.from_acc);
        const toKeys: Keypair = await this.loadKeyPairs(params.to_acc);
        const profitKeys: Keypair = params.profit_acc ? await this.loadKeyPairs(params.profit_acc) : undefined;
        const result: StellarBaseResponse[] = [];
        const fee = profitKeys && params.fee ? params.fee : 0;

        await Promise.all([
            this.accountManager.checkEnoughBalance(fromKeys.publicKey(), params.asset_from + CREDIT, new Decimal(params.amount_from)),
            this.accountManager.checkEnoughBalance(toKeys.publicKey(), params.asset_to + CREDIT, new Decimal(params.amount_to)),
            this.accountManager.checkEnoughBalance(fromKeys.publicKey(), params.asset_to + CREDIT),
            this.accountManager.checkEnoughBalance(toKeys.publicKey(), params.asset_from + CREDIT),
            this.accountManager.checkEnoughBalance(profitKeys.publicKey(), params.asset_from + CREDIT),
        ]);

        result.push(await this.txManager.sendAsset(
            fromKeys, toKeys,
            params.asset_from + CREDIT,
            new Decimal(params.amount_from).minus(fee).toString()
        ));

        if (profitKeys && fee) {
            result.push(await this.txManager.sendAsset(
                fromKeys, profitKeys,
                params.asset_from + CREDIT,
                fee.toString()
            ));
        }

        result.push(await this.txManager.sendAsset(
            toKeys, fromKeys,
            params.asset_to + CREDIT,
            params.amount_to.toString()
        ));

        return result;
    }

    public async createAsset(params: CreateAssetParams): Promise<any> {
        const ownerAccount: Keypair = await this.loadKeyPairs(params.from_acc);
        const trustAccount: Keypair = await this.loadKeyPairs(params.to_acc);
        const trust = await this.txManager.changeTrustLine([params.asset_name + CREDIT,
            params.asset_name + DEBIT],
            ownerAccount,
            trustAccount);
        const result: StellarBaseResponse[] = [];
        await asyncForEach(trust.assets, async (item) => {
            result.push(await this.txManager.sendAsset(
                ownerAccount,
                trustAccount,
                item,
                params.amount.toString()
            ));
        });
        return result;
    }

    public async trustWallet(assets: string[],
                             from_acc: Address,
                             to_acc: Address,
                             isUser: boolean = true): Promise<string[]> {
        const typeAsset = isUser ? CREDIT : DEBIT;
        assets.forEach((item, index) => {
            assets[index] = item + typeAsset;
        });
        const fromKeys: Keypair = await this.loadKeyPairs(from_acc);
        const toKeys: Keypair = await this.loadKeyPairs(to_acc);
        await this.txManager.changeTrustLine(assets,
                                             fromKeys,
                                             toKeys);
        return assets;
    }

    private async loadKeyPairs(account: any, pending: boolean = false): Promise<Keypair> | undefined {
        if (!account) {
            return undefined;
        }

        const keys = await this.storageManager.getAccountKeys(account);

        return pending ? StellarAccountManager.getKeyPair(keys.pending.secret) : StellarAccountManager.getKeyPair(keys.base.secret);
    }
}
