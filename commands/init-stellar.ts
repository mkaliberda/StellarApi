import { env } from '../src/env';
import { IKeyPair } from '../src/lib/keys-storage/IStorage';
import { VaultStorage } from '../src/lib/keys-storage/VaultStorage';
import { CREDIT, DEBIT, SYSTEM_ACCOUNTS } from '../src/lib/stellar/StellarConst';
import { StellarTxManager } from '../src/lib/stellar/StellarTxManager';

const assetsToRSObj = { DIMO: 500000 , TNZS: 500000 }; // initial Tokens Pool
const serviceName = SYSTEM_ACCOUNTS.RS_MAIN; // Name of service
const fundAmt = 20; // Initial balance

const txManager = new StellarTxManager();
const storageManager = new VaultStorage();

const assetsToRSTyped = {};
Object.keys(assetsToRSObj).forEach(item => {
    // modify object to credit and debit type
    assetsToRSTyped[item + CREDIT] = assetsToRSObj[item];
    assetsToRSTyped[item + DEBIT] = assetsToRSObj[item];
});

const createInternalWallet = async (
        assets: any,
        walletName: string,
        balance: number
    ) => {
    const newWalletMain: IKeyPair = await txManager.createAndTrustAccount(Object.keys(assets), balance.toString());
    const newWalletPending: IKeyPair = await txManager.createAndTrustAccount(Object.keys(assets), balance.toString());
    await storageManager.saveAccountKeys(walletName, {base: newWalletMain, pending: newWalletPending });
    console.log('Created wallet: ', newWalletMain);
    return newWalletMain;
};

const asyncForEach = async (array: string[], callback: any) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
};

const fundInternalWallet = async (
        assets: object,
        toWallet: IKeyPair
    ) => {
    // Fund debit and credit token from ROOT account
    console.log('Start fund assets to account');
    const rootPair = StellarTxManager.getKeyPair(env.stellar.seeds.ROOT_SEED);
    const toWalletPair = StellarTxManager.getKeyPair(toWallet.secret);
    asyncForEach(Object.keys(assets), async (item) => {
        await txManager.sendAsset(rootPair, toWalletPair, item, assets[item].toString());
        console.log(`Fundet ${ assets[item].toString() } of ${item}`);
    });
};

createInternalWallet(assetsToRSTyped, serviceName, fundAmt)
    .then(wallet => {
        fundInternalWallet(assetsToRSTyped, wallet)
        .then(() => {
            console.error('====================');
            console.log('Success funded');
            console.error('====================');
        })
        .catch(error => {
            console.error('====================');
            console.error(error);
            console.error('====================');
        });
    })
    .catch(error => {
        console.error('====================');
        console.error(error);
        console.error('====================');
    });
