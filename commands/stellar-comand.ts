import { IKeyPair } from '../src/lib/keys-storage/IStorage';
import { VaultStorage } from '../src/lib/keys-storage/VaultStorage';
import { SYSTEM_ACCOUNTS } from '../src/lib/stellar/StellarConst';
import { StellarTxManager } from '../src/lib/stellar/StellarTxManager';
import asyncForEach from '../src/lib/utils/AsyncForEach';

const txManager = new StellarTxManager();
const storageManager = new VaultStorage();

export const createInternalWallet = async (
    assets: any,
    walletName: string,
    balance: number
) => {
    const newWalletMain: IKeyPair = await txManager.createAndTrustAccount(Object.keys(assets), balance.toString());
    const newWalletPending: IKeyPair = await txManager.createAndTrustAccount(Object.keys(assets), balance.toString());
    await storageManager.saveAccountKeys(walletName, { base: newWalletMain, pending: newWalletPending });
    return newWalletMain;
};

export const fundInternalWallet = async (
    assets: object,
    toWallet: IKeyPair,
    fromService: string = SYSTEM_ACCOUNTS.RS_MAIN
) => {
    // Fund debit and credit token
    console.log(`Start fund from ${ SYSTEM_ACCOUNTS.RS_MAIN } to account`);
    const fundServiceKey = await storageManager.getAccountKeys(fromService);
    const toWalletPair = StellarTxManager.getKeyPair(toWallet.secret);
    const fromWallerPair = StellarTxManager.getKeyPair(fundServiceKey.base.secret);
    asyncForEach(Object.keys(assets), async (item) => {
        await txManager.sendAsset(fromWallerPair, toWalletPair, item, assets[item].toString());
        console.log(`Funded ${ assets[item].toString() } of ${item}`);
    });
};