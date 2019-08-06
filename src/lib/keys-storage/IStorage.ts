interface IKeyPair {
    address: string;
    secret: string;
}

interface IAccountKeys {
    base: IKeyPair;
    pending?: IKeyPair;
    channels?: any;
}

interface IKeysStorage {
    getAccountKeys(address: string): Promise<IAccountKeys>;
    saveAccountKeys(address: string, keys: IAccountKeys): void;
    deleteAccountKeys(address: string): void;
}

export { IKeyPair, IAccountKeys, IKeysStorage };
