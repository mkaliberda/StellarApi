import * as Vault from 'node-vault';
import { HttpError } from 'routing-controllers';

import { ERR_NAMES } from '../../api/errors/constants';
import { env } from '../../env';
import { IAccountKeys, IKeysStorage } from './IStorage';

export class VaultStorage implements IKeysStorage {
    private static SECRET_PATH = 'secret/stellarKeys/';

    private static options: object = {
        apiVersion: 'v1',
        endpoint: env.keysStorage.vault.url,
        token: env.keysStorage.vault.token,
    };

    private static handleResponseException(err: any, address?: string): never {
        let msg;
        const respError = new HttpError(200);

        if (err.response && err.response.statusCode === 404 && address) {
            respError.httpCode = 404;
            msg = `Address ${address} is not found in Vault storage`;
        } else if (err.response.statusCode) {
            respError.httpCode = err.response.statusCode;
        } else {
            respError.httpCode = 400;
        }

        respError.name = ERR_NAMES.vault;
        respError.message = msg || err.message;

        throw respError;
    }

    private vault;

    constructor() {
        this.vault = Vault.default(VaultStorage.options);
    }

    public async getAccountKeys(address: string): Promise<IAccountKeys> {
        let response: any;

        try {
            response = await this.vault.read(`${VaultStorage.SECRET_PATH}${address}`);
        } catch (err) {
            VaultStorage.handleResponseException(err, address);
        }
        return {
            base: {
                address: response.data.base.address,
                secret: response.data.base.secret,
            },
            pending: {
                address: response.data.pending && response.data.pending.address,
                secret: response.data.pending && response.data.pending.secret,
            },
            channels: {
                payloads: response.data.channels ? response.data.channels : undefined,
            },

        };
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
}
