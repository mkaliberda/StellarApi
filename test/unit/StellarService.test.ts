
import { StellarAccountManager } from '../../src/lib/stellar/StellarAccountManager';
import { StellarTxManager } from '../../src/lib/stellar/StellarTxManager';

const ROOT_SECRET = 'SDTACBTJOBL5N44PCE3ZTZMQPEZX7ESLHWWSPE7T463YEQZSRRP2UTOG';

const TO_SEND = {
    address: 'GBSASA52T7B6UEKL5NAOJ6GVVXTUFHFBWPBR3VRJF25GV3MQYFID7Q6N',
    secret: 'SCOR3XYJ42JGFEE3IWC2ZDYIACKRBVYZBJA4WYXF7LC2NYZCQXSIXLKI',
}

describe('StellarTxManager', () => {
    const rootPair = StellarTxManager.getKeyPairFromSecret(ROOT_SECRET);
    const stellaTx = new StellarTxManager(rootPair);
    let userSecret: any;
    let userPair: any;
    jest.setTimeout(30000);
    test('create-account', async (done) => {
        const res = await stellaTx.createAccount();
        console.debug('res', res);
        userSecret = res.secret;
        userPair = StellarTxManager.getKeyPairFromSecret(res.secret);
        expect(3).toBe(3);
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
        const res = await stellaTx.createAndTrustAccount(array);
        console.log(res);
        expect(3).toBe(3);
        done();
    });
    test('sendAsset', async (done) => {
        const destPair = StellarTxManager.getKeyPairFromSecret(TO_SEND.secret);
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
    const stellaAccount = new StellarAccountManager();
    test('getBalances', async (done) => {
        const address = 'GAU63SOWRTPXBWOWFVA3CRGS22G3DJQNIPDOVSJVZ6AOWI45QPX6W6RM';
        const info = await stellaAccount.getBalances(address);
        console.log(info);
        expect(3).toBe(3);
        done();
    });
});
