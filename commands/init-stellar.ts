import { env } from '../src/env';
import { IKeyPair } from '../src/lib/keys-storage/IStorage';
import { VaultStorage } from '../src/lib/keys-storage/VaultStorage';
import { CREDIT, DEBIT, SYSTEM_ACCOUNTS } from '../src/lib/stellar/StellarConst';
import { StellarTxManager } from '../src/lib/stellar/StellarTxManager';
import { createInternalWallet, fundInternalWallet } from './stellar-command';

const assetsToRSObj = { DIMO: 10000 , TNZS: 10000 }; // initial Tokens Pool
const fundAmtRS = 1000; // Initial balance
const serviceName = SYSTEM_ACCOUNTS.RS_MAIN; // Name of service
const storageManager = new VaultStorage();

const assetsToRSTyped = {};
Object.keys(assetsToRSObj).forEach(item => {
    // modify object to credit and debit type
    assetsToRSTyped[item + CREDIT] = assetsToRSObj[item];
    assetsToRSTyped[item + DEBIT] = assetsToRSObj[item];
});

const saveRootAccount = async () => {
    const rootPair = StellarTxManager.getKeyPair(env.stellar.seeds.ROOT_SEED);
    const rootWaller: IKeyPair = {
        address: rootPair.publicKey(),
        secret: rootPair.secret(),
    };
    await storageManager.saveAccountKeys(SYSTEM_ACCOUNTS.ROOT, { base: rootWaller, pending: rootWaller });
    console.log('Saved ROOT to Vault');
};

saveRootAccount()
    .then(() => {
        createInternalWallet(assetsToRSTyped, serviceName, fundAmtRS)
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
    })
    .catch(error => {
        console.error('====================');
        console.error(error);
        console.error('====================');
    });
