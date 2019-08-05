
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
    let secondAddress: Address;

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

        const responseSec = await request(settings.app).post('/api/wallet/create')
            .set('Accept', 'application/json')
            .send(newAddrParams);
        secondAddress = responseSec.body;
    });

    jest.setTimeout(60000);

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
            .query({ 'assets[]': [assetArray[0]] });
        expect(balance.body.base.credit[0].balance).toBe('0.0000000');
        done();
    });

    test('simple-deposit-to-first-address', async (done) => {
        // deposit to setUp account
        const amt = 10;
        const asset = assetArray[0];
        await request(settings.app).post('/api/wallet/deposit')
            .set('Accept', 'application/json')
            .send({
                user_acc: firstAddress,
                amount: amt,
                asset,
            });
        await request(settings.app).post('/api/wallet/deposit')
            .set('Accept', 'application/json')
            .send({
                user_acc: firstAddress,
                amount: amt,
                asset: assetArray[1],
            });
        const balance = await request(settings.app).get(`/api/wallet/balance/${firstAddress}`)
            .query({ 'assets[]': [asset] });
        const base = balance.body.base;
        console.log(balance.body);
        expect(base.credit[0].balance).toBe("10.0000000");
        done();
    });

    test('core-service-fee-deposit-to-first-address', async (done) => {
        // deposit to setUp account
        const fee = 0.99;
        const amt = 10;
        const asset = assetArray[0];
        const balanceProfitBefore = await request(settings.app).get(`/api/wallet/balance/${ SYSTEM_ACCOUNTS.CORE_MAIN }`)
            .query({ 'assets[]': [asset] });
        const balBeforeDec =  new Decimal(JSON.parse(balanceProfitBefore.text).base.credit[0].balance);
        await request(settings.app).post('/api/wallet/deposit')
            .set('Accept', 'application/json')
            .send({
                user_acc: firstAddress,
                amount: amt,
                fee,
                asset,
            });
        const balanceProfitAfter = await request(settings.app).get(`/api/wallet/balance/${ SYSTEM_ACCOUNTS.CORE_MAIN }`)
            .query({ 'assets[]': [asset] });
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

    test('hold-money-and-withdraw-after', async (done) => {
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
            .query({ 'assets[]': [astName], 'include_pending': true });

        const balAfterHoldDec =  new Decimal(balanceAfterHold.body.base.credit[0].balance);
        const balAfterHoldPendingDec =  new Decimal(balanceAfterHold.body.pending.credit[0].balance);

        expect(balStartDec.minus(balAfterHoldDec)).toEqual(new Decimal(amt));
        await request(settings.app).post(`/api/wallet/withdraw/`)
            .set('Accept', 'application/json')
            .send({
                user_acc: accountHold,
                amount: amt,
                asset: astName,
            });

        const balanceAfterWithdrawHold = await request(settings.app).get(`/api/wallet/balance/${ accountHold }`)
            .query({ 'assets[]': [astName], 'include_pending': true });
        const balanceAfterWithdrawDec =  new Decimal(balanceAfterWithdrawHold.body.pending.credit[0].balance);

        expect(balAfterHoldPendingDec.minus(balanceAfterWithdrawDec)).toEqual(new Decimal(amt));
        done();
    });

    test('transfer-money-default', async (done) => {
        // hold-monney to setUp account
        const amt = 2;
        const fee = 0.99;
        const astName = 'DIMO';
        const accountFrom = firstAddress; //SYSTEM_ACCOUNTS.RS_MAIN;
        const accountTo = secondAddress;
        const accountProfit = SYSTEM_ACCOUNTS.CORE_MAIN; // MUST BE DEFAULT

        const balanceStartFrom = await request(settings.app).get(`/api/wallet/balance/${ accountFrom }`)
            .query({ 'assets[]': [astName] });
        const balanceStartTo = await request(settings.app).get(`/api/wallet/balance/${ accountTo }`)
            .query({ 'assets[]': [astName] });
        const balanceStartProfit = await request(settings.app).get(`/api/wallet/balance/${ accountProfit }`)
            .query({ 'assets[]': [astName] });

        const balanceStartFromDec =  new Decimal(balanceStartFrom.body.base.credit[0].balance);
        const balanceStartToDec =  new Decimal(balanceStartTo.body.base.credit[0].balance);
        const balanceStartProfitDec =  new Decimal(balanceStartProfit.body.base.credit[0].balance);

        await request(settings.app).post(`/api/wallet/transfer/`)
            .set('Accept', 'application/json')
            .send({
                sender_acc: accountFrom,
                receiver_acc: accountTo,
                amount: amt,
                asset: astName,
                fee,
            });
        const balanceAfterFrom = await request(settings.app).get(`/api/wallet/balance/${ accountFrom }`)
            .query({ 'assets[]': [astName] });
        const balanceAfterTo = await request(settings.app).get(`/api/wallet/balance/${ accountTo }`)
            .query({ 'assets[]': [astName] });
        const balanceAfterProfit = await request(settings.app).get(`/api/wallet/balance/${ accountProfit }`)
            .query({ 'assets[]': [astName] });

        const amtWFee = new Decimal(amt).plus(fee);
        const balanceAfterFromDec =  new Decimal(balanceAfterFrom.body.base.credit[0].balance);
        const balanceAfterToDec =  new Decimal(balanceAfterTo.body.base.credit[0].balance);
        const balanceProfitToDec =  new Decimal(balanceAfterProfit.body.base.credit[0].balance);
        //  TODO CHECK MINUS
        expect(balanceStartFromDec.minus(balanceAfterFromDec)).toEqual(amtWFee);
        expect(balanceAfterToDec.minus(balanceStartToDec)).toEqual(new Decimal(amt));
        expect(balanceProfitToDec.minus(balanceStartProfitDec)).toEqual(new Decimal(fee));
        done();
    });

    test('exchange-money', async (done) => {
        // hold-monney to setUp account
        const amt_from = 2;
        const amt_to = 4;
        const fee = 0.11;
        const astFrom = assetArray[1];
        const astTo = assetArray[0];
        const accountFrom = SYSTEM_ACCOUNTS.RS_MAIN; //firstAddress;
        const accountTo = SYSTEM_ACCOUNTS.CORE_MAIN; //secondAddress;

        const balanceBeforeFrom = await request(settings.app).get(`/api/wallet/balance/${accountFrom}`)
            .query({ 'assets[]': [astFrom] });
        const balanceBeforeTo = await request(settings.app).get(`/api/wallet/balance/${accountTo}`)
            .query({ 'assets[]': [astFrom] });
        const balanceBeforeProfit = await request(settings.app).get(`/api/wallet/balance/${SYSTEM_ACCOUNTS.CORE_MAIN}`)
            .query({ 'assets[]': [astFrom] });

        const balanceBeforeFromDec = new Decimal(balanceBeforeFrom.body.base.credit[0].balance);
        const balanceBeforeToDec = new Decimal(balanceBeforeTo.body.base.credit[0].balance);
        const balanceBeforeProfitDec = new Decimal(balanceBeforeProfit.body.base.credit[0].balance);

        const resp = await request(settings.app).post(`/api/wallet/exchange/`)
            .set('Accept', 'application/json')
            .send({
                asset_from: astFrom,
                asset_to: astTo,
                from_acc: accountFrom,
                to_acc: accountTo,
                amount_from: amt_from,
                amount_to: amt_to,
                fee,
            });

        const balanceAfterFrom = await request(settings.app).get(`/api/wallet/balance/${accountFrom}`)
            .query({ 'assets[]': [astFrom] });
        const balanceAfterTo = await request(settings.app).get(`/api/wallet/balance/${accountTo}`)
            .query({ 'assets[]': [astFrom] });
        const balanceAfterProfit = await request(settings.app).get(`/api/wallet/balance/${SYSTEM_ACCOUNTS.CORE_MAIN}`)
            .query({ 'assets[]': [astFrom] });

        const amtFromWFee = new Decimal(amt_from).plus(fee);
        const balanceAfterFromDec = new Decimal(balanceAfterFrom.body.base.credit[0].balance);
        const balanceAfterToDec = new Decimal(balanceAfterTo.body.base.credit[0].balance);
        const balanceProfitToDec = new Decimal(balanceAfterProfit.body.base.credit[0].balance);
        console.log(amtFromWFee, balanceBeforeFromDec, balanceAfterFromDec);

        // expect(balanceBeforeFromDec.minus(balanceAfterFromDec)).toEqual(amtFromWFee);
        // expect(balanceBeforeToDec.minus(balanceAfterToDec)).toEqual(new Decimal(amt_to));
        // expect(balanceBeforeProfitDec.minus(balanceProfitToDec)).toEqual(new Decimal(fee));

        done();
    });
});
