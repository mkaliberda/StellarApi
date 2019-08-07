import { Asset, Keypair, Network, Operation, Server } from 'stellar-sdk';

import { env } from '../../env';
import { ERROR } from './StellarConst';
import { BadSeqError, BaseError } from './StellarError';

if (env.stellar.network.passphrase) {
    Network.use(new Network(env.stellar.network.passphrase));
} else {
    Network.useTestNetwork();
}

export class StellarBaseManager {

    public static getKeyPair(secret: string): Keypair {
        try {
            return Keypair.fromSecret(secret);
        } catch (error) {
            return StellarBaseManager.handleResponseException(error);
        }
    }

    protected static handleResponseException(err: any): never {
        switch (err) {
            case err.response.data.extras.result_codes === ERROR.RES_CODES.BAD_SEQ:
                throw new BadSeqError();
            default:
                throw new BaseError(`Stellar network return error ${ err.response.data.extras.result_codes }`);
        }
    }

    protected static getAsset(asset: string): Asset {
        return new Asset(asset, Keypair.fromSecret(env.stellar.seeds.ROOT_SEED).publicKey());
    }

    public server: Server;

    constructor() {
        this.server = new Server(env.stellar.network.uri, {allowHttp: true});
    }

    public createTrustOperations(assetToTrust: string[],
                                 issuerAddress: string,
                                 destAddr: string): any[] {
        const operationsTrust: any[] = [];
        assetToTrust.forEach((item) => {
            const operation = Operation.changeTrust({
                asset: new Asset(item, issuerAddress),
                source: destAddr,
            });
            operationsTrust.push(operation);
        });
        return operationsTrust;
    }
}
