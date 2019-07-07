import { IAccountKeys, IKeysStorage } from '../../src/lib/keys-storage/IStorage';
import { VaultStorage } from '../../src/lib/keys-storage/VaultStorage';

describe('Vault storage tests', () => {
    const storage: IKeysStorage = new VaultStorage();
    const keys: IAccountKeys = {
        base: {
            address: 'GBSALEPFZQMIAOMLIBKMRGIA2OM4TE265PT2W6BZO6ASFXJGBRI2QKNJ',
            secret: 'SD74CV3NSI5TFFLP2VB6UQE3BGMRRYFJ5Y3YHCHXJ3MMXPQ3XBMO4BET',
        },
        pending: {
            address: 'GD2SFBGZ3J47XSTQE4FPCPCGEGYL2CYR5GCYED35DLVJKLRKRCOUAEZJ',
            secret: 'SAIQTHEOZSEQ5YT7ZUWFA4H7FVY7MCZYEVJ5366FHIT32LQXG5V7Z2TW',
        },
    };

    test('Check is account keys stored properly', async (done) => {
        storage.saveAccountKeys(keys.base.address, keys);
        const response = await storage.getAccountKeys(keys.base.address);
        expect(response.base.secret).toBe(keys.base.secret);
        expect(response.pending.secret).toBe(keys.pending.secret);
        expect(response.pending.address).toBe(keys.pending.address);
        done();
    });

    test('Check if account keys is deleted properly', async (done) => {
        await storage.deleteAccountKeys(keys.base.address);
        try {
            await storage.getAccountKeys(keys.base.address);
        } catch (err) {
            expect(err).toEqual(new Error(`Address ${keys.base.address} is not found in Vault storage`));
        }
        done();
    });
});
