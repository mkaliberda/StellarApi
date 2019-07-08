import { StellarService } from '../../src/api/services/StellarService';
import { LogMock } from './lib/LogMock';

describe('StellarServiceTest', () => {
    test('create-waller', async (done) => {
        const assets = [
            'DINO',
            'BTC',
        ];
        const log = new LogMock();
        const service = new StellarService(log);
        const res = await service.createWallet(assets);
        console.log(res);
        done();
    });
});
