import { Asset, Keypair, Network, Operation, Server } from 'stellar-sdk';

import { env } from '../../env';

export class StellarBaseManager {
    public server: Server;

    constructor() {
        if (env.stellar.network.isTest) {
            Network.useTestNetwork();
        } else {
            Network.usePublicNetwork();
        }
        this.server = new Server(env.stellar.network.uri);
    }

    public getKeyPairFromSecret(secret: string): Keypair {
        return Keypair.fromSecret(secret);
    }

    public createTrustOperations(assetToTrust: string[],
                                 IssuerAddress: string,
                                 destAddr: string): any[] {
        const operationsTrust: any[] = [];
        assetToTrust.forEach((item) => {
            const operation = Operation.changeTrust({
                asset: new Asset(item, IssuerAddress),
                source: destAddr,
            });
            operationsTrust.push(operation);
        });
        return operationsTrust;
    }
}
