import { CREDIT, DEBIT, SYSTEM_ACCOUNTS } from '../src/lib/stellar/StellarConst';
import { createInternalWallet, fundInternalWallet } from './stellar-command';

const assetsCoreObj = { DIMO: 3000 , TNZS: 3000 }; // initial Tokens Pool
const coreMainName = SYSTEM_ACCOUNTS.CORE_MAIN; // Name of CORE ACCOUNT
const fundAmt = 3000; // Initial balance
const coreServiceName = SYSTEM_ACCOUNTS.CORE_SERVICE; // Name of CORE ACCOUNT

const assetsOnlyDebit = {};
const assetsOnlyCredit = {};

Object.keys(assetsCoreObj).forEach(item => {
    // modify object to credit and debit type
    assetsOnlyCredit[item + CREDIT] = assetsCoreObj[item];
    assetsOnlyDebit[item + DEBIT] = assetsCoreObj[item];
});

// Create Core Main Account

createInternalWallet(assetsOnlyCredit, coreMainName, fundAmt)
    .then(coreWallet => {
        fundInternalWallet(assetsOnlyCredit, coreWallet, SYSTEM_ACCOUNTS.RS_MAIN)
        .then(() => {
            console.error('====================');
            console.log('Success Main Core funded');
            console.error('====================');
            // Create Core Main Account
            createInternalWallet(assetsOnlyDebit, coreServiceName, fundAmt)
            .then(serviceWallet => {
                fundInternalWallet(assetsOnlyDebit, serviceWallet, SYSTEM_ACCOUNTS.RS_MAIN)
                .then(() => {
                    console.error('====================');
                    console.log('Success Service Core funded');
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
    })
    .catch(error => {
        console.error('====================');
        console.error(error);
        console.error('====================');
    });
