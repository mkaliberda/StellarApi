import { StellarService } from '../../src/api/services/StellarService';
import { LogMock } from './lib/LogMock';
import { Address } from '../../src/lib/stellar/StellarPatterns';
import { BalanceParams } from '../../src/api/validators/ApiValidatorBalance';

describe('StellarServiceTest', () => {
    jest.setTimeout(60000);
    let newAddress: Address;
    const log = new LogMock();
    const service = new StellarService(log);
    test('new-wallet', async () => {
        const assets = [
            'DINO',
            'BTC',
        ];
        const res = await service.createWallet(assets, true, 100);
        console.log(res);
        newAddress = res;
        // done();
    });
    test('get-balance', async () => {
        console.log('newAddress TEST', newAddress);
        const assets = [
            'DINO',
            'BTC',
        ];
        const balParams = new BalanceParams();
        balParams.assets = assets;
        const res = await service.getAccountBalance(newAddress, balParams);
        console.log(res);
        // done();
    });
});
