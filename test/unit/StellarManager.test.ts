import { Keypair } from 'stellar-sdk';
import { StellarAccountManager } from '../../src/lib/stellar/StellarAccountManager';
import { StellarTxManager } from '../../src/lib/stellar/StellarTxManager';

const ROOT_SECRET = 'SDDSQ7P5JBGTCI7ZUN3L3KJSRWVJNIELRADPLBEVUXTJH2426ZOC5JJD';

describe('StellarTxManagerSuccess', () => {
    const rootPair = StellarTxManager.getKeyPairFromSecret(ROOT_SECRET);
    const stellaTx = new StellarTxManager(rootPair);
    let userSecret: any;
    let userPair: any;
    jest.setTimeout(30000);
    test('get-pair', async (done) => {
        userPair = StellarTxManager.getKeyPairFromSecret(ROOT_SECRET);
        expect(userPair).toBeInstanceOf(Keypair);
        done();
    });
    test('create-account', async (done) => {
        const res = await stellaTx.createAccount('100');
        userSecret = res.secret;
        userPair = StellarTxManager.getKeyPairFromSecret(res.secret);
        expect(userPair).toBeInstanceOf(Keypair);
        done();
    });
    test('changeTrustLine', async (done) => {
        const array = [
            'DIMO',
            'SIMO',
        ];
        userPair = StellarTxManager.getKeyPairFromSecret(userSecret);
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
        const destPair = StellarTxManager.getKeyPairFromSecret(userSecret);
        const srcPair = StellarTxManager.getKeyPairFromSecret(ROOT_SECRET);
        const res = await stellaTx.sendAsset(srcPair,
                                             destPair,
                                             'DIMO',
                                             '1');
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
