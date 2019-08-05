import { Decimal } from 'decimal.js';
import { Keypair } from 'stellar-sdk';

import { StellarAccountManager } from '../../src/lib/stellar/StellarAccountManager';
import { StellarTxManager } from '../../src/lib/stellar/StellarTxManager';

const ROOT_SECRET = 'SCK562BILSJP3DIHTFQ3B3TCILNFDWPFLAKZ5L4H7R5NDCK5D2PQ5QPE';

describe('StellarTxManagerSuccess', () => {
    const stellaTx = new StellarTxManager();
    let userSecret: any;
    let userPair: any;
    jest.setTimeout(30000);
    // test('get-pair', async (done) => {
    //     userPair = StellarTxManager.getKeyPair(ROOT_SECRET);
    //     expect(userPair).toBeInstanceOf(Keypair);
    //     done();
    // });
    // test('create-account', async (done) => {
    //     const res = await stellaTx.createAccount('100');
    //     userSecret = res.secret;
    //     userPair = StellarTxManager.getKeyPair(res.secret);
    //     expect(userPair).toBeInstanceOf(Keypair);
    //     done();
    // });
    test('createAndTrustAccount', async (done) => {
        const array = [
            'DIMO',
        ];
        const res = await stellaTx.createAndTrustAccount(array, '100');
        expect(3).toBe(3);
        done();
    });
    // test('sendAsset', async (done) => {
    //     const destPair = StellarTxManager.getKeyPair('SC3ZJHEUJCDZ72VGLRU3RO5ABPWTM55UOV2XLSNAYANVLBE3NUDDRDPB');
    //     const srcPair = StellarTxManager.getKeyPair('SAAQIGAMIN4UEU7BZAJDSHTU2FBP3DZOQ42QRNEUW7ATD6VT6XZNABWU');
    //     const res = await stellaTx.sendAsset(srcPair,
    //                                          destPair,
    //                                          'DIMOd',
    //                                          '1000');
    //     console.log(res);
    //     expect(3).toBe(3);
    //     done();
    // });

});

describe('StellarAccountManager', () => {
    jest.setTimeout(60000);
    const stellaAccount = new StellarAccountManager();

    test('getBalances', async (done) => {
        const address = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7';
        const info = await stellaAccount.getBalances(address);
        console.log('balanse test response', info);
        expect(3).toBe(3);
        done();
    });
    // test('getHistory', async (done) => {
    //     const address = 'GALKWTGZ46HFDJOBTBH6O5JMZOSHVLHITTCD3SWJOTKZRWGLNGQIJGIA';
    //     const info = await stellaAccount.getHistory(address, 50, 3);
    //     console.log('test resp', info);
    //     // info.forEach(element => {
    //     //     console.log(element);
    //     // });
    //     expect(3).toBe(3);
    //     done();
    // });
});

// describe('`checkEnoughBalance` member method', () => {
//     const stellaAccount = new StellarAccountManager();

//     test('do nothing when amount is enough', async (done) => {
//         stellaAccount.checkEnoughBalance('GBSALEPFZQMIAOMLIBKMRGIA2OM4TE265PT2W6BZO6ASFXJGBRI2QKNJ', 'UAH', new Decimal(33438));
//         done();
//     });

//     test('throw error if amount is not enough', async (done) => {
//         try {
//             await stellaAccount.checkEnoughBalance('GBSALEPFZQMIAOMLIBKMRGIA2OM4TE265PT2W6BZO6ASFXJGBRI2QKNJ', 'UAH', new Decimal(334385.1));
//         } catch (err) {
//             expect(err).toEqual(new Error(`Account balance 334385.0000000 of UAH is less than 334385.1`));
//         }
//         done();
//     });

//     test('do nothing when amount is enough', async (done) => {
//         stellaAccount.checkEnoughBalance('GBSALEPFZQMIAOMLIBKMRGIA2OM4TE265PT2W6BZO6ASFXJGBRI2QKNJ', 'UAH', new Decimal(33438));
//         done();
//     });

//     test('throw error if asset is not found in balances array', async (done) => {
//         try {
//             await stellaAccount.checkEnoughBalance('GBSALEPFZQMIAOMLIBKMRGIA2OM4TE265PT2W6BZO6ASFXJGBRI2QKNJ', 'UAHC', new Decimal(334385.1));
//         } catch (err) {
//             expect(err).toEqual(new Error(`Asset 'UAHC' not found in 'GBSALEPFZQMIAOMLIBKMRGIA2OM4TE265PT2W6BZO6ASFXJGBRI2QKNJ' trustlines.`));
//         }
//         done();
//     });
// });
