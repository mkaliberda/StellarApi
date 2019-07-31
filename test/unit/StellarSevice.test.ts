
import { StellarService } from '../../src/api/services/StellarService';
import { BalanceParams } from '../../src/api/validators/ApiValidatorBalance';
import { LogMock } from './lib/LogMock';

describe('StellarServiceTest', () => {
    jest.setTimeout(60000);
    // const ROOT_SECRET = env.stellar.seeds.ROOT_SEED;
    // const stellaTx = new StellarTxManager();
    // let newAddress: Address;
    const assetArray = [
        'DIMO',
        'TNZS',
    ];
    let accountFirst;

    const log = new LogMock();
    const service = new StellarService(log);

    beforeAll(async () => {
        accountFirst = await service.createWallet(assetArray, true, 10);
    });

    test('get-balance', async (done) => {
        const balParams: BalanceParams = {
            assets: ['DIMO', 'TNZS'],
            include_pending: 'true',
        };
        const balance = await service.getAccountBalance(accountFirst, balParams);
        expect(balance.base.credit[0].balance).toBe('0.0000000');
        done();
    });

    test('create-wallets', async (done) => {
        const balParams: BalanceParams = {
            assets: ['DIMO', 'TNZS'],
            include_pending: 'true',
        };
        await service.createInternalWallet(assetArray, 'RS_TEST_MAIN', 10);
        const balance = await service.getAccountBalance('RS_TEST_MAIN', balParams);
        expect(balance.base.credit[0].balance).toBe('0.0000000');
        done();
    });

});
