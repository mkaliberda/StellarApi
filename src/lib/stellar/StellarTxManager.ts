import { Keypair, Memo, Operation, TransactionBuilder } from 'stellar-sdk';

import { env } from '../../env';
import { IKeyPair } from '../../lib/keys-storage/IStorage';
import { StellarAccountManager } from './StellarAccountManager';
import { StellarBaseManager } from './StellarBaseManager';

export class StellarTxManager extends StellarBaseManager {

    private static getPairRoot(): Keypair {
        return Keypair.fromSecret(env.stellar.seeds.ROOT_SEED);
    }

    constructor() {
        super();
    }

    public async createAccount(balance: string): Promise<IKeyPair> {
        const transaction: any = await this._getTxBuilder();
        const newPair = Keypair.random();

        transaction.addOperation(
            Operation.createAccount({
                destination: newPair.publicKey(),
                startingBalance: balance,
            })
        );
        const tx = transaction.build();
        tx.sign(...[StellarTxManager.getPairRoot()]);
        try {
            await this.server.submitTransaction(tx);
        } catch (err) {
            StellarBaseManager.handleResponseException(err);
        }
        return {
            address: newPair.publicKey(),
            secret: newPair.secret(),
        };
    }

    public async changeTrustLine(assetToTrust: string[],
                                 srcKeyPair: Keypair,
                                 destKeyPair: Keypair): Promise<any> {
        if (assetToTrust === undefined || assetToTrust.length === 0) {
            throw new Error('assetToTrust have contain minimum 1 element');
        }
        const transaction: any = await this._getTxBuilder(destKeyPair);

        this.createTrustOperations(assetToTrust,
            srcKeyPair.publicKey(),
            destKeyPair.publicKey()).forEach(element => {
            transaction.addOperation(element);
        });
        const tx = transaction.build();
        tx.sign(...[destKeyPair]);
        try {
            await this.server.submitTransaction(tx);
        } catch (err) {
            StellarAccountManager.handleResponseException(err);
        }
        return { assets: assetToTrust };
    }

    public async createAndTrustAccount(assetToTrust: string[], balance: string): Promise<IKeyPair> {
        if (assetToTrust === undefined || assetToTrust.length === 0) {
            throw new Error('assetToTrust have contain minimum 1 element');
        }
        const transaction: any = await this._getTxBuilder();
        const newPair = Keypair.random();

        transaction.addOperation(
            Operation.createAccount({
                destination: newPair.publicKey(),
                startingBalance: balance,
            })
        );
        this.createTrustOperations(assetToTrust,
            StellarTxManager.getPairRoot().publicKey(),
            newPair.publicKey()).forEach(element => {
            transaction.addOperation(element);
        });
        const tx = transaction.build();
        tx.sign(...[StellarTxManager.getPairRoot(), newPair]);
        try {
            await this.server.submitTransaction(tx);
        } catch (err) {
            StellarBaseManager.handleResponseException(err);
        }
        return {
            address: newPair.publicKey(),
            secret: newPair.secret(),
        };
    }

    public async sendAsset(srcKeyPair: Keypair,
                           destKeyPair: Keypair,
                           asset: string,
                           amount: string,
                           channelPair?: Keypair,
                           memo?: string): Promise<any> {
        const buildFromAccount = channelPair ? channelPair : srcKeyPair;
        const transaction: any = await this._getTxBuilder(buildFromAccount);
        transaction.addOperation(
            Operation.payment({
                destination: destKeyPair.publicKey(),
                asset: StellarBaseManager.getAsset(asset),
                amount,
                source: srcKeyPair.publicKey(),
            })
        );
        const tx = transaction.build();
        if (channelPair) {
            tx.sign(...[srcKeyPair, channelPair]);
        } else {
            tx.sign(...[srcKeyPair]);
        }
        let response: any;
        try {
            response = await this.server.submitTransaction(tx);
        } catch (err) {
            StellarBaseManager.handleResponseException(err);
        }
        return {
            hash: response.hash,
            ledger: response.ledger,
        };
    }

    private async _getTxBuilder(fromPair?: Keypair, memo?: string): Promise<any> {
        const memoText = Memo.text(memo || '');
        const address = fromPair ? fromPair.publicKey() : StellarTxManager.getPairRoot().publicKey();
        const account = await this.server.loadAccount(address);
        const options = {
            fee: await this.server.fetchBaseFee(),
            memo: memoText,
            timebounds: await this.server.fetchTimebounds(100),
        };
        return new TransactionBuilder(account, options);
    }
}
