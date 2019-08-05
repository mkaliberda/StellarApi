import { CREDIT, DEBIT, SYSTEM_ACCOUNTS } from '../src/lib/stellar/StellarConst';
import { createInternalWallet, fundInternalWallet } from './stellar-comand';

const assetsToRSObj = { DIMO: 500000 , TNZS: 500000 }; // initial Tokens Pool
const coreMainName = SYSTEM_ACCOUNTS.CORE_MAIN; // Name of CORE ACCOUNT
// const coreServiceName = SYSTEM_ACCOUNTS.CORE_SERVICE; // Name of CORE ACCOUNT
const fundAmt = 1000; // Initial balance

const assetsOnlyDebit = {};
const assetsOnlyCredit = {};

Object.keys(assetsToRSObj).forEach(item => {
    // modify object to credit and debit type
    assetsOnlyCredit[item + CREDIT] = assetsToRSObj[item];
    assetsOnlyDebit[item + DEBIT] = assetsToRSObj[item];
});

// Create Core Main Account

createInternalWallet(assetsOnlyCredit, coreMainName, fundAmt)
    .then(wallet => {
        fundInternalWallet(assetsOnlyCredit, wallet, SYSTEM_ACCOUNTS.RS_MAIN)
        .then(() => {
            console.error('====================');
            console.log('Success Main Core funded');
            console.error('====================');
            // Create Core Main Account
            createInternalWallet(assetsOnlyDebit, coreMainName, fundAmt)
            .then(wallet => {
                fundInternalWallet(assetsOnlyDebit, wallet, SYSTEM_ACCOUNTS.RS_MAIN)
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
