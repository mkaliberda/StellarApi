import { Decimal } from 'decimal.js';
import { Keypair } from 'stellar-sdk';

import { env } from '../../src/env';
import { IKeyPair } from '../../src/lib/keys-storage/IStorage';
import { StellarAccountManager } from '../../src/lib/stellar/StellarAccountManager';
import { StellarTxManager } from '../../src/lib/stellar/StellarTxManager';

describe('StellarTxManagerBase', () => {
    const ROOT_SECRET = env.stellar.seeds.ROOT_SEED;
    const assetArray = [
        'DIMOd',
        'DIMOc',
        'TNZSd',
        'TNZSc',
    ];
    const stellaTx = new StellarTxManager();
    let rootPair: Keypair;
    let accountFirst;
    let accountSecond;
    jest.setTimeout(30000);

    beforeAll(async () => {
        accountFirst = await stellaTx.createAndTrustAccount(assetArray, '100');
        accountSecond = await stellaTx.createAndTrustAccount(assetArray, '100');
    });
    test('base get pair for root', async (done) => {
        rootPair = StellarTxManager.getKeyPair(ROOT_SECRET);
        expect(rootPair).toBeInstanceOf(Keypair);
        done();
    });
    test('create-account-and-trust-after', async (done) => {
        const userSepTrust: IKeyPair = await stellaTx.createAccount('100');
        const userSepTrustKeyPair: Keypair  = StellarTxManager.getKeyPair(userSepTrust.secret);
        expect(userSepTrustKeyPair).toBeInstanceOf(Keypair);
        expect(userSepTrust).toHaveProperty('secret');
        expect(userSepTrust).toHaveProperty('address');
        const destKeyPair =  StellarTxManager.getKeyPair(userSepTrust.secret);
        await stellaTx.changeTrustLine(assetArray,
                                       rootPair,
                                       destKeyPair);
        done();
    });
    test('createAndTrustAccount', async (done) => {
        const respAcc = await stellaTx.createAndTrustAccount(assetArray, '100');
        expect(respAcc).toHaveProperty('secret');
        expect(respAcc).toHaveProperty('address');
        expect(3).toBe(3);
        done();
    });

    test('accountFirst', async (done) => {
        console.log('accountFirst', accountFirst);
        done();
    });
});

// describe('StellarAccountManager', () => {
//     jest.setTimeout(60000);
//     const stellaAccount = new StellarAccountManager();

//     test('getBalances', async (done) => {
//         const address = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7';
//         const info = await stellaAccount.getBalances(address);
//         console.log('balanse test response', info);
//         expect(3).toBe(3);
//         done();
//     });
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
// });

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
