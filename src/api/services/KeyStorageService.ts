import { Service } from 'typedi';

import { IAccountKeys, IKeysStorage } from '../../lib/keys-storage/IStorage';
import { VaultStorage } from '../../lib/keys-storage/VaultStorage';

@Service()
export class KeyStorageService {
    private storage: IKeysStorage;

    constructor() {
        this.storage = new VaultStorage();
    }

    public getAccountKeys(address: string): Promise<IAccountKeys> {
        return this.storage.getAccountKeys(address);
    }

    public storeAccountKeys(address: string, keys: IAccountKeys): void {
        this.storage.saveAccountKeys(address, keys);
    }
}
