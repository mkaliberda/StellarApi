
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
    const countUp = 5;
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

    test('simple-deposit-to-first-address-sync-with-channels', async (done) => {
        // deposit to setUp account
        const amt = 10;
        const asset = assetArray[0];
        const promiseF =  request(settings.app).post('/api/wallet/deposit')
            .set('Accept', 'application/json')
            .send({
                user_acc: firstAddress,
                amount: amt,
                asset,
                index: 0,
            });
        const promiseS = request(settings.app).post('/api/wallet/deposit')
            .set('Accept', 'application/json')
            .send({
                user_acc: firstAddress,
                amount: amt,
                asset: assetArray[1],
                index: 1,
            });
        const response = await Promise.all([promiseF, promiseS]);
        response.forEach(item => {
            expect(item.status).toBe(200);
        });
        const balance = await request(settings.app).get(`/api/wallet/balance/${firstAddress}`)
            .query({ 'assets[]': [asset] });
        const base = balance.body.base;
        console.log(balance.body);
        expect(base.credit[0].balance).toBe('10.0000000');
        done();
    });

    test('core-service-fee-deposit-to-first-address-sync-with-channels', async (done) => {
        // deposit to setUp account
        const fee = 1;
        const amt = 30;
        const asset = assetArray[0];
        const toAccount = firstAddress;

        const balanceProfitBefore = await request(settings.app).get(`/api/wallet/balance/${ SYSTEM_ACCOUNTS.CORE_MAIN }`)
            .query({ 'assets[]': [asset] });
        const balanceToAccountBefore = await request(settings.app).get(`/api/wallet/balance/${toAccount}`)
            .query({ 'assets[]': [asset] });

        const balanceProfitBeforeDec =  new Decimal(balanceProfitBefore.body.base.credit[0].balance);
        const balanceToAccountBeforeDec = new Decimal(balanceToAccountBefore.body.base.credit[0].balance);

        const reqArray = [];
        for (let i = 0; i < countUp; i++) {
            const resp = request(settings.app).post('/api/wallet/deposit')
                .set('Accept', 'application/json')
                .send({
                    user_acc: toAccount,
                    amount: amt,
                    fee,
                    asset,
                    index: i,
                });
            reqArray.push(resp);
        }
        const respArray = await Promise.all(reqArray);
        respArray.forEach(item => {
            expect(item.status).toBe(200);
        });

        const balanceProfitAfter = await request(settings.app).get(`/api/wallet/balance/${ SYSTEM_ACCOUNTS.CORE_MAIN }`)
            .query({ 'assets[]': [asset] });
        const balanceToAccountAfter = await request(settings.app).get(`/api/wallet/balance/${toAccount}`)
            .query({ 'assets[]': [asset] });

        const balanceProfitAfterDec =  new Decimal(JSON.parse(balanceProfitAfter.text).base.credit[0].balance);
        const balanceToAccountAfterDec = new Decimal(JSON.parse(balanceToAccountAfter.text).base.credit[0].balance);

        expect(new Decimal(fee).mul(countUp)).toEqual(balanceProfitAfterDec.minus(balanceProfitBeforeDec));
        expect(new Decimal(amt).mul(countUp)).toEqual(balanceToAccountAfterDec.minus(balanceToAccountBeforeDec));

        done();
    });

    test('hold-money-and-un-hold-after', async (done) => {
        // hold-monney to setUp account
        const amt = 0.99;
        const astName = 'DIMO';
        const accountHold = SYSTEM_ACCOUNTS.RS_MAIN;
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
        const balanceAfterReverseDec =  new Decimal(balanceAfterReverse.body.base.credit[0].balance);
        expect(balanceAfterReverseDec.minus(balAfterHoldDec)).toEqual(new Decimal(amt));
        done();
    });

    test('hold-money-and-withdraw-after', async (done) => {
        // hold-monney to setUp account
        const toHold = 1.99; // (1 + 0.99) * 5
        const amt = 1;
        const fee = 0.99;
        const astName = 'DIMO';
        const accountHold = SYSTEM_ACCOUNTS.RS_MAIN;
        const balanceStart = await request(settings.app).get(`/api/wallet/balance/${ accountHold}`)
            .query({ 'assets[]': [astName] });
        const balStartDec =  new Decimal(balanceStart.body.base.credit[0].balance);
        const respHold = await request(settings.app).post(`/api/wallet/hold/${ accountHold }`)
            .set('Accept', 'application/json')
            .send({
                asset: astName,
                amount: toHold,
            });
        expect(respHold.status).toBe(200);
        const balanceAfterHold = await request(settings.app).get(`/api/wallet/balance/${ accountHold }`)
            .query({ 'assets[]': [astName], 'include_pending': true });

        const balAfterHoldDec =  new Decimal(balanceAfterHold.body.base.credit[0].balance);
        const balAfterHoldPendingDec =  new Decimal(balanceAfterHold.body.pending.credit[0].balance);

        expect(balStartDec.minus(balAfterHoldDec)).toEqual(new Decimal(toHold));

        const respW = await request(settings.app).post(`/api/wallet/withdraw/`)
            .set('Accept', 'application/json')
            .send({
                user_acc: accountHold,
                amount: amt,
                asset: astName,
                sender_acc: firstAddress,
                fee,
                index: 2,
            });
        expect(respW.status).toBe(200);
        const balanceAfterWithdrawHold = await request(settings.app).get(`/api/wallet/balance/${ accountHold }`)
            .query({ 'assets[]': [astName], 'include_pending': true });
        const balanceAfterWithdrawHoldDec =  new Decimal(balanceAfterWithdrawHold.body.pending.credit[0].balance);
        expect(balAfterHoldPendingDec.minus(balanceAfterWithdrawHoldDec)).toEqual(new Decimal(toHold));
        done();
    });

    test('transfer-money-default', async (done) => {
        // hold-monney to setUp account
        const amt = 2;
        const fee = 0.99;
        const astName = 'DIMO';
        const accountFrom = firstAddress; // SYSTEM_ACCOUNTS.RS_MAIN;
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
        const accountFrom = firstAddress;
        const accountTo = SYSTEM_ACCOUNTS.CORE_MAIN;
        const accountProfit = secondAddress;

        const balanceBeforeFrom = await request(settings.app).get(`/api/wallet/balance/${accountFrom}`)
            .query({ 'assets[]': [astFrom] });
        const balanceBeforeTo = await request(settings.app).get(`/api/wallet/balance/${accountTo}`)
            .query({ 'assets[]': [astFrom] });
        const balanceBeforeProfit = await request(settings.app).get(`/api/wallet/balance/${accountProfit}`)
            .query({ 'assets[]': [astFrom] });

        const balanceBeforeFromSec = await request(settings.app).get(`/api/wallet/balance/${accountFrom}`)
            .query({ 'assets[]': [astTo] });
        const balanceBeforeToSec = await request(settings.app).get(`/api/wallet/balance/${accountTo}`)
            .query({ 'assets[]': [astTo] });

        const balanceBeforeFromDec = new Decimal(balanceBeforeFrom.body.base.credit[0].balance);
        const balanceBeforeToDec = new Decimal(balanceBeforeTo.body.base.credit[0].balance);
        const balanceBeforeProfitDec = new Decimal(balanceBeforeProfit.body.base.credit[0].balance);

        const balanceBeforeFromDecSec = new Decimal(balanceBeforeFromSec.body.base.credit[0].balance);
        const balanceBeforeToDecSec = new Decimal(balanceBeforeToSec.body.base.credit[0].balance);

        await request(settings.app).post(`/api/wallet/exchange/`)
            .set('Accept', 'application/json')
            .send({
                asset_from: astFrom,
                asset_to: astTo,
                from_acc: accountFrom,
                to_acc: accountTo,
                amount_from: amt_from,
                amount_to: amt_to,
                profit_acc: accountProfit,
                fee,
                index: 1,
            });

        const balanceAfterFrom = await request(settings.app).get(`/api/wallet/balance/${accountFrom}`)
            .query({ 'assets[]': [astFrom] });
        const balanceAfterTo = await request(settings.app).get(`/api/wallet/balance/${accountTo}`)
            .query({ 'assets[]': [astFrom] });
        const balanceAfterProfit = await request(settings.app).get(`/api/wallet/balance/${accountProfit}`)
            .query({ 'assets[]': [astFrom] });

        const balanceAfterFromSec = await request(settings.app).get(`/api/wallet/balance/${accountFrom}`)
            .query({ 'assets[]': [astTo] });
        const balanceAfterToSec = await request(settings.app).get(`/api/wallet/balance/${accountTo}`)
            .query({ 'assets[]': [astTo] });

        const amtFromWFee = new Decimal(amt_from).plus(fee);
        const balanceAfterFromDec = new Decimal(balanceAfterFrom.body.base.credit[0].balance);
        const balanceAfterToDec = new Decimal(balanceAfterTo.body.base.credit[0].balance);
        const balanceProfitAfterDec = new Decimal(balanceAfterProfit.body.base.credit[0].balance);

        const balanceAfterFromDecSec = new Decimal(balanceAfterFromSec.body.base.credit[0].balance);
        const balanceAfterToDecSec = new Decimal(balanceAfterToSec.body.base.credit[0].balance);

        console.log(amtFromWFee, balanceBeforeFromDec, balanceAfterFromDec);

        expect(balanceBeforeFromDec.minus(balanceAfterFromDec)).toEqual(amtFromWFee);
        expect(balanceAfterFromDecSec.minus(balanceBeforeFromDecSec)).toEqual(new Decimal(amt_to));
        expect(balanceProfitAfterDec.minus(balanceBeforeProfitDec)).toEqual(new Decimal(fee));

        expect(balanceBeforeToDecSec.minus(balanceAfterToDecSec)).toEqual(new Decimal(amt_to));
        expect(balanceAfterToDec.minus(balanceBeforeToDec)).toEqual(new Decimal(amt_from));
        expect(balanceBeforeToDecSec.minus(balanceAfterToDecSec)).toEqual(new Decimal(amt_to));

        done();
    });
});
