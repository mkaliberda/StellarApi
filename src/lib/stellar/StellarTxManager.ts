import { Keypair, Operation, TransactionBuilder } from 'stellar-sdk';

import { env } from '../../env';
import { StellarBaseManager } from './StellarBaseManager';

export class StellarTxManager extends StellarBaseManager {
    public pairRoot: Keypair;

    constructor(secretRoot: string) {
        super();
        this.pairRoot = Keypair.fromSecret(secretRoot);
    }

    public async createAccount(): Promise<any> {
        let transaction: any;
        const newPair = Keypair.random();
        try {
            transaction = await this._buildTx();
        } catch (err) {
            throw new Error('TODO ADD EXCEPTION 1' + err);
        }
        transaction.addOperation(
            Operation.createAccount({
                destination: newPair.publicKey(),
                startingBalance: env.stellar.seeds.init_xlm_amt,
            })
        );
        const tx = transaction.build();
        tx.sign(...[this.pairRoot]);
        let response: any;
        try {
            response = await this.server.submitTransaction(tx);
        } catch (err) {
            throw new Error('TODO ADD EXCEPTION 2' + err);
        }
        return {
            address: newPair.publicKey(),
            secret: newPair.secret(),
            hash: response.hash,
            ledger: response.ledger,
        };
    }

    public async changeTrustLine(assetToTrust: string[],
                                 destKeyPair: Keypair): Promise<any> {
        if (assetToTrust === undefined || assetToTrust.length === 0) {
            throw new Error('assetToTrust have contain minimum 1 element');
        }
        let transaction: any;
        try {
            transaction = await this._buildTx(destKeyPair);
        } catch (err) {
            throw new Error('TODO ADD EXCEPTION 1' + err);
        }
        this.createTrustOperations(assetToTrust,
                                   this.pairRoot.publicKey(),
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

    public async createAndTrustAccount(assetToTrust: string[]): Promise<any> {
        if (assetToTrust === undefined || assetToTrust.length === 0) {
            throw new Error('assetToTrust have contain minimum 1 element');
        }
        let transaction: any;
        const newPair = Keypair.random();
        try {
            transaction = await this._buildTx();
        } catch (err) {
            throw new Error('TODO ADD EXCEPTION 1' + err);
        }
        transaction.addOperation(
            Operation.createAccount({
                destination: newPair.publicKey(),
                startingBalance: env.stellar.seeds.init_xlm_amt,
            })
        );
        this.createTrustOperations(assetToTrust,
                                   this.pairRoot.publicKey(),
                                   newPair.publicKey()).forEach(element => {
            transaction.addOperation(element);
        });
        const tx = transaction.build();
        tx.sign(...[this.pairRoot, newPair]);
        let response: any;
        try {
            response = await this.server.submitTransaction(tx);
        } catch (err) {
            throw new Error('TODO ADD EXCEPTION 2' + err);
        }
        return {
            address: newPair.publicKey(),
            secret: newPair.secret(),
            hash: response.hash,
            ledger: response.ledger,
        };
    }

    private async _buildTx(fromPair?: Keypair): Promise<any> {
        const address = fromPair ? fromPair.publicKey() : this.pairRoot.publicKey();
        const account = await this.server.loadAccount(address);
        const options = { fee: 100, // await this.server.fetchBaseFee(),
                          timebounds: await this.server.fetchTimebounds(100),
                        };
        return new TransactionBuilder(account, options);
    }
}
