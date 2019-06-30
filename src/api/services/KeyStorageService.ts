import { Service } from 'typedi';
import { IAccountKeys, IKeysStorage } from '../../lib/keys-storage/IStorage';
import { VaultStorage } from '../../lib/keys-storage/VaultStorage';

@Service()
export class KeyStorageService {
    private storage: IKeysStorage;

    constructor() {
        this.storage = new VaultStorage();
    }

    public getAccountKeys(address: string): IAccountKeys {
        return this.storage.getAccountKeys(address);
    }

    public storeAccountKeys(keys: IAccountKeys): void {
        this.storage.saveAccountKeys(keys);
    }
}
