import { StellarService } from '../../src/api/services/StellarService';
import { LogMock } from './lib/LogMock';

describe('StellarServiceTest', () => {
    test('new-waller', async (done) => {
        const assets = [
            'DINO',
            'BTC',
        ];
        const log = new LogMock();
        const service = new StellarService(log);
        const res = await service.createWallet(assets, true, 100);
        console.log(res);
        done();
    });
});
