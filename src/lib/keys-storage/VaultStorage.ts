import * as Vault from 'node-vault';

import { env } from '../../env';
import { IAccountKeys, IKeyPair, IKeysStorage } from './IStorage';

export class VaultStorage implements IKeysStorage {
    private static SECRET_PATH = '/secret/stellarKeys/';

    private static options: object = {
        apiVersion: 'v1',
        endpoint: env.keysStorage.vault.url,
        token: env.keysStorage.vault.token,
    };

    private static handleResponseException(err: any, address?: string): never {
        if (err.response.statusCode === 404 && address) {
            throw new Error(`Address ${address} is not found in Vault storage`);
        } else {
            throw new Error(err);
        }
    }

    private vault;

    constructor() {
        this.vault = Vault.default(VaultStorage.options);
    }

    public async getAccountKeys(address: string): Promise<IAccountKeys> {
        let response: any;

        try {
            response = await this.vault.read(`secret/${address}`);
        } catch (err) {
            VaultStorage.handleResponseException(err, address);
        }
        return response.data;
    }

    public async saveAccountKeys(address: string, keys: IAccountKeys): Promise<void> {
        try {
            await this.vault.write(`${VaultStorage.SECRET_PATH}${address}`, keys);
        } catch (err) {
            VaultStorage.handleResponseException(err);
        }
    }

    public async deleteAccountKeys(address: string): Promise<void> {
        try {
            await this.vault.delete(`${VaultStorage.SECRET_PATH}${address}`);
        } catch (err) {
            VaultStorage.handleResponseException(err);
        }
    }

    public getBasePair(address: string): IKeyPair {
        const keys: any = this.getAccountKeys(address);
        return keys.base;
    }

    public getPendingPair(address: string): IKeyPair {
        const keys: any = this.getAccountKeys(address);
        return keys.private;
    }
}
