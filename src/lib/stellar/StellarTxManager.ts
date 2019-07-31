import { Keypair, Memo, Operation, TransactionBuilder } from 'stellar-sdk';

import { env } from '../../env';
import { IKeyPair } from '../../lib/keys-storage/IStorage';
import { StellarBaseManager } from './StellarBaseManager';
import { StellarBaseResponse } from './StellarPatterns';

export class StellarTxManager extends StellarBaseManager {

    private static getPairRoot(): Keypair {
        return Keypair.fromSecret(env.stellar.seeds.ROOT_SEED);
    }

    constructor() {
        super();
    }

    public async createAccount(balance: string): Promise<IKeyPair> {
        let transaction: any;
        const newPair = Keypair.random();
        try {
            transaction = await this._getTxBuilder();
        } catch (err) {
            throw new Error('TODO ADD EXCEPTION 1' + err);
        }
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
            console.log(err.response.data.extras);
            throw new Error('TODO ADD EXCEPTION 2' + err);
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
        let transaction: any;
        try {
            transaction = await this._getTxBuilder(destKeyPair);
        } catch (err) {
            throw new Error('TODO ADD EXCEPTION 1' + err);
        }
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
            throw new Error('TODO ADD EXCEPTION 2' + err);
        }
        return {
            assets: assetToTrust,
        };
    }

    public async createAndTrustAccount(assetToTrust: string[], balance: string): Promise<IKeyPair> {
        if (assetToTrust === undefined || assetToTrust.length === 0) {
            throw new Error('assetToTrust have contain minimum 1 element');
        }
        let transaction: any;
        const newPair = Keypair.random();
        try {
            transaction = await this._getTxBuilder();
        } catch (err) {
            throw new Error('TODO ADD EXCEPTION 1' + err);
        }
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
            console.log(err.response.data.extras);
            throw new Error('TODO ADD EXCEPTION 2' + err);
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
                           memo?: string): Promise<StellarBaseResponse> {
        let transaction: any;
        try {
            transaction = await this._getTxBuilder(srcKeyPair);
        } catch (err) {
            throw new Error('TODO ADD EXCEPTION 1' + err);
        }
        transaction.addOperation(
            Operation.payment({
                destination: destKeyPair.publicKey(),
                asset: StellarBaseManager.getAsset(asset),
                amount,
            })
        );
        const tx = transaction.build();
        tx.sign(...[srcKeyPair]);
        let response: any;
        try {
            response = await this.server.submitTransaction(tx);
        } catch (err) {
            throw new Error(response);
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
            fee: 100, // await this.server.fetchBaseFee(),
            memo: memoText,
            timebounds: await this.server.fetchTimebounds(100),
        };
        return new TransactionBuilder(account, options);
    }
}
