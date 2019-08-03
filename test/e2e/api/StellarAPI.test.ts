
import { Decimal } from 'decimal.js';
import request from 'supertest';

import { SYSTEM_ACCOUNTS } from '../../../src/lib/stellar/StellarConst';
import { Address } from '../../../src/lib/stellar/StellarPatterns';
import { bootstrapApp, BootstrapSettings } from '../utils/bootstrap';

describe('apiWallet', () => {
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
        firstAddress = response.body;
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
        await request(settings.app).post('/api/wallet/trust')
            .set('Accept', 'application/json')
            .send(params);
        const balBTC = await request(settings.app).get(`/api/wallet/balance/${firstAddress}`)
            .query({ 'assets[]': ['BTC'] });
        expect(balBTC.body).toHaveProperty('base');
        done();
    });

    test('simple-get-balance', async (done) => {
        // deposit to setUp account
        const balance = await request(settings.app).get(`/api/wallet/balance/${firstAddress}`)
            .query({ 'assets[]': ['DIMO'] });
        expect(balance.body.base.credit[0].balance).toBe('0.0000000');
        done();
    });

    test('simple-deposit-to-first-address', async (done) => {
        // deposit to setUp account
        await request(settings.app).post('/api/wallet/deposit')
            .set('Accept', 'application/json')
            .send({
                user_acc: firstAddress,
                amount: 100,
                asset: 'DIMO',
            });
        const balance = await request(settings.app).get(`/api/wallet/balance/${firstAddress}`)
            .query({ 'assets[]': ['DIMO'] });
        const base = balance.body.base;
        console.log(balance.body);
        // expect(base.credit[0].balance).toBe('100.0000000');
        done();
    });

    test('core-service-fee-deposit-to-first-address', async (done) => {
        // deposit to setUp account
        const fee = 0.99;
        const balanceProfitBefore = await request(settings.app).get(`/api/wallet/balance/${ SYSTEM_ACCOUNTS.CORE_MAIN }`)
            .query({ 'assets[]': ['DIMO'] });
        const balBeforeDec =  new Decimal(JSON.parse(balanceProfitBefore.text).base.credit[0].balance);
        await request(settings.app).post('/api/wallet/deposit')
            .set('Accept', 'application/json')
            .send({
                user_acc: firstAddress,
                amount: 100,
                fee,
                asset: 'DIMO',
            });
        const balanceProfitAfter = await request(settings.app).get(`/api/wallet/balance/${ SYSTEM_ACCOUNTS.CORE_MAIN }`)
            .query({ 'assets[]': ['DIMO'] });
        const balAfterDec =  new Decimal(JSON.parse(balanceProfitAfter.text).base.credit[0].balance);
        expect(new Decimal(fee)).toEqual(balAfterDec.minus(balBeforeDec));
        done();
    });

    test('hold-monney-and-unhold-after', async (done) => {
        // hold-monney to setUp account
        const amt = 0.99;
        const astName = 'DIMO';
        const accountHold = firstAddress;
        const balanceStart = await request(settings.app).get(`/api/wallet/balance/${ accountHold}`)
            .query({ 'assets[]': [astName] });
        const balStartDec =  new Decimal(balanceStart.body.base.credit[0].balance);

        await request(settings.app).post(`/api/wallet/hold/${ accountHold }`)
            .set('Accept', 'application/json')
            .send({
                asset: astName,
                amount: amt,
            });

        const balanceAfterHold = await request(settings.app).get(`/api/wallet/balance/${ accountHold }`)
            .query({ 'assets[]': [astName] });
        const balAfterHoldDec =  new Decimal(balanceAfterHold.body.base.credit[0].balance);
        expect(balStartDec.minus(balAfterHoldDec)).toEqual(new Decimal(amt));

        await request(settings.app).post(`/api/wallet/hold/${ accountHold }`)
            .set('Accept', 'application/json')
            .send({
                asset: astName,
                amount: amt,
                reverse: true,
            });

        const balanceAfterReverse  = await request(settings.app).get(`/api/wallet/balance/${ accountHold }`)
            .query({ 'assets[]': [astName] });
        const balbalanceAfterReverseDec =  new Decimal(balanceAfterReverse.body.base.credit[0].balance);
        expect(balbalanceAfterReverseDec.minus(balAfterHoldDec)).toEqual(new Decimal(amt));
        done();
    });

    test('hold-monney-and-withdraw-after', async (done) => {
        // hold-monney to setUp account
        const amt = 0.99;
        const astName = 'DIMO';
        const accountHold = 'CORE_MAIN';
        const balanceStart = await request(settings.app).get(`/api/wallet/balance/${ accountHold}`)
            .query({ 'assets[]': [astName] });
        const balStartDec =  new Decimal(balanceStart.body.base.credit[0].balance);

        await request(settings.app).post(`/api/wallet/hold/${ accountHold }`)
            .set('Accept', 'application/json')
            .send({
                asset: astName,
                amount: amt,
            });
        const balanceAfterHold = await request(settings.app).get(`/api/wallet/balance/${ accountHold }`)
            .query({ 'assets[]': [astName] });
        const balAfterHoldDec =  new Decimal(balanceAfterHold.body.base.credit[0].balance);
        expect(balStartDec.minus(balAfterHoldDec)).toEqual(new Decimal(amt));
        const resp = await request(settings.app).post(`/api/wallet/hold/${ accountHold }`)
            .set('Accept', 'application/json')
            .send({
                user_acc: accountHold,
                amount: amt,
                asset: astName,
                fee: 12,
            });
        console.log('resp!!!!!!', resp.body);
        done();
    });

});
