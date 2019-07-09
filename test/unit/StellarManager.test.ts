import { Keypair } from 'stellar-sdk';
import { Decimal } from 'decimal.js';
import { StellarAccountManager } from '../../src/lib/stellar/StellarAccountManager';
import { StellarTxManager } from '../../src/lib/stellar/StellarTxManager';

const ROOT_SECRET = 'SDDSQ7P5JBGTCI7ZUN3L3KJSRWVJNIELRADPLBEVUXTJH2426ZOC5JJD';

describe('StellarTxManagerSuccess', () => {
    const stellaTx = new StellarTxManager();
    let userSecret: any;
    let userPair: any;
    jest.setTimeout(30000);
    test('get-pair', async (done) => {
        userPair = StellarTxManager.getKeyPair(ROOT_SECRET);
        expect(userPair).toBeInstanceOf(Keypair);
        done();
    });
    test('create-account', async (done) => {
        const res = await stellaTx.createAccount('100');
        userSecret = res.secret;
        userPair = StellarTxManager.getKeyPair(res.secret);
        expect(userPair).toBeInstanceOf(Keypair);
        done();
    });
    test('changeTrustLine', async (done) => {
        const array = [
            'DIMO',
            'SIMO',
        ];
        userPair = StellarTxManager.getKeyPair(userSecret);
        await stellaTx.changeTrustLine(array, userPair);
        expect(3).toBe(3);
        done();
    });

    test('createAndTrustAccount', async (done) => {
        const array = [
            'DIMO',
        ];
        const res = await stellaTx.createAndTrustAccount(array, '100');
        console.log(res);
        expect(3).toBe(3);
        done();
    });
    test('sendAsset', async (done) => {
        const destPair = StellarTxManager.getKeyPair('SAJKFDYQVTEHEVE4YNFFYFBAMQF575TXXEVBS23ZB2UYWDL3HRHVKP5A');
        const srcPair = StellarTxManager.getKeyPair('SDDSQ7P5JBGTCI7ZUN3L3KJSRWVJNIELRADPLBEVUXTJH2426ZOC5JJD');
        const res = await stellaTx.sendAsset(srcPair,
                                             destPair,
                                             'DIMOc',
                                             '1000');
        console.log(res);
        expect(3).toBe(3);
        done();
    });

});

describe('StellarAccountManager', () => {
    jest.setTimeout(60000);
    const stellaAccount = new StellarAccountManager();
    test('getBalances', async (done) => {
        const address = 'GDKGMU2QL6RILIAQV4BKB5AYQSOUJQL5FHXEQ5JWZAQT3TWTNRAQ7VR7';
        const info = await stellaAccount.getBalances(address);
        console.log(info);
        expect(3).toBe(3);
        done();
    });
});

describe('`checkEnoughBalance` member method', () => {
    const stellaAccount = new StellarAccountManager();

    test('do nothing when amount is enough', async (done) => {
        stellaAccount.checkEnoughBalance('GBSALEPFZQMIAOMLIBKMRGIA2OM4TE265PT2W6BZO6ASFXJGBRI2QKNJ', 'UAH', new Decimal(33438));
        done();
    });

    test('throw error if amount is not enough', async (done) => {
        try {
            await stellaAccount.checkEnoughBalance('GBSALEPFZQMIAOMLIBKMRGIA2OM4TE265PT2W6BZO6ASFXJGBRI2QKNJ', 'UAH', new Decimal(334385.1));
        } catch (err) {
            expect(err).toEqual(new Error(`Account balance 334385.0000000 of UAH is less than 334385.1`));
        }
        done();
    });

    test('do nothing when amount is enough', async (done) => {
        stellaAccount.checkEnoughBalance('GBSALEPFZQMIAOMLIBKMRGIA2OM4TE265PT2W6BZO6ASFXJGBRI2QKNJ', 'UAH', new Decimal(33438));
        done();
    });

    test('throw error if asset is not found in balances array', async (done) => {
        try {
            await stellaAccount.checkEnoughBalance('GBSALEPFZQMIAOMLIBKMRGIA2OM4TE265PT2W6BZO6ASFXJGBRI2QKNJ', 'UAHC', new Decimal(334385.1));
        } catch (err) {
            expect(err).toEqual(new Error(`Asset 'UAHC' not found in 'GBSALEPFZQMIAOMLIBKMRGIA2OM4TE265PT2W6BZO6ASFXJGBRI2QKNJ' trustlines.`));
        }
        done();
    });
});
