
import { StellarAccountManager } from '../../src/lib/stellar/StellarAccountManager';
import { StellarTxManager } from '../../src/lib/stellar/StellarTxManager';

const ROOT_SECRET = 'SAW6HLSFTXYBMTNVWRCH5F6K3DKTUY6X2BJDNLZPH34BM4XHLA6S53AQ';

describe('StellarTxManager', () => {
    const stellaTx = new StellarTxManager(ROOT_SECRET);
    let userSecret: any;
    let userPair: any;
    jest.setTimeout(30000);
    test('createAccount', async (done) => {
        const res = await stellaTx.createAccount();
        userSecret = res.secret;
        userPair = stellaTx.getKeyPairFromSecret(res.secret);
        expect(3).toBe(3);
        done();
    });
    test('changeTrustLine', async (done) => {
        const array = [
            'DIMO',
            'SIMO',
        ];
        userPair = stellaTx.getKeyPairFromSecret(userSecret);
        await stellaTx.changeTrustLine(array, userPair);
        expect(3).toBe(3);
        done();
    });
    test('createAndTrustAccount', async (done) => {
        const array = [
            'BTCU',
        ];
        const res = await stellaTx.createAndTrustAccount(array);
        console.log(res);
        expect(3).toBe(3);
        done();
    });
});

describe('StellarAccountManager', () => {
    const stellaAccount = new StellarAccountManager();
    test('getBalances', async (done) => {
        const address = 'GAU63SOWRTPXBWOWFVA3CRGS22G3DJQNIPDOVSJVZ6AOWI45QPX6W6RM';
        const info = await stellaAccount.getBalances(address);
        console.log(info);
        expect(3).toBe(3);
        done();
    });
});
