import { Asset, Keypair, Network, Operation, Server } from 'stellar-sdk';

import { env } from '../../env';
import { BadAddressError } from './StellarError';

export class StellarBaseManager {

    public static getKeyPair(secret: string): Keypair {
        try {
            return Keypair.fromSecret(secret);
        } catch (error) {
            throw new BadAddressError('Bad secret format ' + secret);
        }
    }

    public server: Server;

    constructor() {
        if (env.stellar.network.isTest) {
            Network.useTestNetwork();
        } else {
            Network.usePublicNetwork();
        }
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
