import { IAccountKeys, IKeysStorage } from '../../src/lib/keys-storage/IStorage';
import { VaultStorage } from '../../src/lib/keys-storage/VaultStorage';

describe('Vault storage tests', () => {
    const storage: IKeysStorage = new VaultStorage();
    const keys: IAccountKeys = {
        base: {
            address: '12341234123412341',
            secret: '22222222222222222',
        },
        pending: {
            address: '33333333333333333',
            secret: '44444444444444444',
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
