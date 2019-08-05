import request from 'supertest';

import { SYSTEM_ACCOUNTS } from '../../../src/lib/stellar/StellarConst';
import { Address } from '../../../src/lib/stellar/StellarPatterns';
// import { env } from '../../../src/env';
import { bootstrapApp, BootstrapSettings } from '../utils/bootstrap';

describe('/api', () => {
    // -------------------------------------------------------------------------
    // Setup up
    // -------------------------------------------------------------------------
    const assetArray = [
        'DIMO',
        'TNZS',
    ];
    let settings: BootstrapSettings;
    let firstAddress: Address;

    beforeAll(async () => {
        settings = await bootstrapApp();
        const newAddrParams = {
            assets: JSON.stringify(assetArray),
            is_user: true,
            amount: 100,
        };
        const response = await request(settings.app).post('/api/wallet/create')
            .set('Accept', 'application/json')
            .send(newAddrParams);
        console.log(response.text);
        firstAddress = JSON.parse(response.text);
    });

    jest.setTimeout(30000);

    // -------------------------------------------------------------------------
    // Test cases
    // -------------------------------------------------------------------------

    test('trust-to-another-asset', async (done) => {
        // trust to new asset
        const newAssets = ['BTC'];
        const params = {
            assets: JSON.stringify(newAssets),
            from_acc: firstAddress,
        };
        const response = await request(settings.app).post('/api/wallet/trust')
            .set('Accept', 'application/json')
            .send(params);
        expect(response.body).toBe(newAssets);
        done();
    });

    test('deposit-to-first-address', async (done) => {
        // deposit to setUp account
        let response;
        response = await request(settings.app).post('/api/wallet/deposit')
            .set('Accept', 'application/json')
            .send({
                user_acc: firstAddress,
                service_acc: SYSTEM_ACCOUNTS.RS_MAIN,
                amount: 10,
                fee: 0,
                asset: 'DIMO',
            });
        done();
        console.log(response.body);
    });

});
