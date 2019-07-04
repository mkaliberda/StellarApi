interface IKeyPair {
    address: string;
    private: string;
}

interface IAccountKeys {
    base: IKeyPair;
    pending?: IKeyPair;
}

interface IKeysStorage {
    getAccountKeys(address: string): any;
    getBasePair(address: string): IKeyPair;
    getPendingPair(address: string): IKeyPair;
    saveAccountKeys(address: string, keys: IAccountKeys): void;
    deleteAccountKeys(address: string): void;
}

export { IKeyPair, IAccountKeys, IKeysStorage };
