import { Decimal } from 'decimal.js';
import { Keypair } from 'stellar-sdk';

import { env } from '../../src/env';
import { IKeyPair } from '../../src/lib/keys-storage/IStorage';
import { StellarAccountManager } from '../../src/lib/stellar/StellarAccountManager';
import { BalanceError, NoTrustlineError } from '../../src/lib/stellar/StellarError';
import { StellarTxManager } from '../../src/lib/stellar/StellarTxManager';

let rootPair: Keypair;

describe('StellarTxManagerBase', () => {
    const ROOT_SECRET = env.stellar.seeds.ROOT_SEED;
    const assetArray = [
        'DIMOc',
        'DIMOd',
        'TNZSc',
        'TNZSd',
    ];
    const stellaTx = new StellarTxManager();
    const stellaAccount = new StellarAccountManager();
    let accountFirst;
    let accountSecond;
    jest.setTimeout(30000);

    beforeAll(async () => {
        accountFirst = await stellaTx.createAndTrustAccount(assetArray, '100');
        accountSecond = await stellaTx.createAndTrustAccount(assetArray, '100');
        rootPair = StellarTxManager.getKeyPair(ROOT_SECRET);
    });

    test('create-account-and-trust-after 1', async (done) => {
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
    test('createAndTrustAccount 2', async (done) => {
        const respAcc = await stellaTx.createAndTrustAccount(assetArray, '100');
        expect(respAcc).toHaveProperty('secret');
        expect(respAcc).toHaveProperty('address');
        done();
    });

    test('sendAssetFromRootToFirst 3', async (done) => {
        const haveBalance = '1.9999999';
        const accountFirstPair = StellarTxManager.getKeyPair(accountFirst.secret);
        await stellaTx.sendAsset(rootPair,
                                accountFirstPair,
                                assetArray[0],
                                haveBalance);
        const balancesFirst = await stellaAccount.getBalances(accountFirstPair.publicKey());
        balancesFirst.forEach(item => {
            if (item.asset_code === assetArray[0]) {
                expect(item.balance).toBe(haveBalance);
            }
        });
        done();
    });

    test('sendAssetFromFirstToSecond', async (done) => {
        const haveBalance = '1.9999999';
        const accountFirstPair = StellarTxManager.getKeyPair(accountFirst.secret);
        const accountSecondPair = StellarTxManager.getKeyPair(accountSecond.secret);
        console.log(accountFirstPair, assetArray, haveBalance);
        await stellaTx.sendAsset(accountFirstPair,
                                 accountSecondPair,
                                 assetArray[0],
                                 haveBalance);
        const balancesFirst = await stellaAccount.getBalances(accountFirstPair.publicKey());
        let getAsset = 0;
        balancesFirst.forEach(item => {
            if (item.asset_code === assetArray[0]) {
                expect(item.balance).toBe('0.0000000');
                getAsset += 1;
            }
        });
        expect(getAsset).toBe(1);
        getAsset = 0;
        const balancesSecond = await stellaAccount.getBalances(accountSecondPair.publicKey());
        balancesSecond.forEach(item => {
            if (item.asset_code === assetArray[0]) {
                expect(item.balance).toBe(haveBalance);
                getAsset += 1;
            }
        });
        expect(getAsset).toBe(1);
        done();
    });

    // test('get bad address', async (done) => {
    //     const badAddress = 'BAD ADDRESS';
    //     try {
    //         await stellaAccount.getBalances(badAddress);
    //     } catch (err) {
    //         expect(err).toThrowError();
    //     }
    //     done();
    // });

    test('do nothing when amount is enough', async (done) => {
        await stellaAccount.checkEnoughBalance(accountSecond.address, assetArray[0], new Decimal(1.9999999));
        done();
    });

    test('throw error if amount is not enough', async (done) => {
        try {
            await stellaAccount.checkEnoughBalance(accountSecond.address, 'DIMOr', new Decimal(1.9999999));
        } catch (err) {
            expect(err).toEqual(new NoTrustlineError(accountSecond.address, 'DIMOr'));
        }
        done();
    });

    test('throw error if asset is not found in balances array', async (done) => {
        try {
            await stellaAccount.checkEnoughBalance(accountSecond.address, assetArray[0], new Decimal(1.9999999));
        } catch (err) {
            expect(err).toEqual(new BalanceError(accountSecond.address, assetArray[0], 1.9999999));
        }
        done();
    });
});

describe('StellarAccountManager', () => {
    jest.setTimeout(60000);
    const stellaAccountInstance = new StellarAccountManager();

    test('getTxHistory', async (done) => {
        const info = await stellaAccountInstance.getTxHistory(rootPair.publicKey(), 50, 3);
        info.forEach(element => {
            expect(element).toHaveProperty('id');
        });
        done();
    });
});
