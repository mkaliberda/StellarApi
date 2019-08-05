import { IAccountKeys, IKeysStorage } from '../../src/lib/keys-storage/IStorage';
import { VaultStorage } from '../../src/lib/keys-storage/VaultStorage';
import { SYSTEM_ACCOUNTS } from '../../src/lib/stellar/StellarConst';

// // GBSALEPFZQMIAOMLIBKMRGIA2OM4TE265PT2W6BZO6ASFXJGBRI2QKNJ

describe('Vault storage tests', () => {
    const storage: IKeysStorage = new VaultStorage();
    const NAME = 'TEST';
    const keys: IAccountKeys = {
        base: {
            address: 'GCSHY2NI6YJED5IRZIJDKZELBQQH3S5CKH5IPU22SWWX26UYVW54D63O',
            secret: 'SC3ZJHEUJCDZ72VGLRU3RO5ABPWTM55UOV2XLSNAYANVLBE3NUDDRDPB',
        },
        pending: {
            address: 'GCSHY2NI6YJED5IRZIJDKZELBQQH3S5CKH5IPU22SWWX26UYVW54D63O',
            secret: 'SC3ZJHEUJCDZ72VGLRU3RO5ABPWTM55UOV2XLSNAYANVLBE3NUDDRDPB',
        },
    };

    test('Check is account keys stored properly', async (done) => {
        storage.saveAccountKeys(NAME, keys);
        const response = await storage.getAccountKeys(NAME);
        console.log('response', response.base.secret);
        expect(response.base.secret).toBe(keys.base.secret);
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
