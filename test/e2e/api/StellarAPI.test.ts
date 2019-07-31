import request from 'supertest';

import { env } from '../../../src/env';
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
    let accountFirst;
    beforeAll(async () => {
        const newAddrParams = {
            "assets": "[\"DIMO\", \"TNZS\"]",
            "is_user": true,
            "amount": 100,
        };
        settings = await bootstrapApp();
        accountFirst = await request(settings.app).post('/api/wallet/create')
        .send(newAddrParams)
        .set('Accept', 'application/json');
    });

    // -------------------------------------------------------------------------
    // Test cases
    // -------------------------------------------------------------------------

    test('GET: / should return the api-version', async (done) => {
        console.log('accountFirst', accountFirst);
        // const response = await request(settings.app)
        //     .get(`/api/wallet/balance/${ accountFirst }`)
        //     .expect(200);
        // const respJson = JSON.parse(response.text);
        // console.log(respJson);
        // expect(response.text.base).toBe('0.0000000');
        done();
    });

});
