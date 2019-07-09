import { IAccountKeys, IKeysStorage } from '../../src/lib/keys-storage/IStorage';
import { VaultStorage } from '../../src/lib/keys-storage/VaultStorage';
// GBSALEPFZQMIAOMLIBKMRGIA2OM4TE265PT2W6BZO6ASFXJGBRI2QKNJ
describe('Vault storage tests', () => {
    const storage: IKeysStorage = new VaultStorage();
    const keys: IAccountKeys = {
        base: {
            address: 'GB3HXCJ3ESAJ4K7ZMUKRIOZE2SI7W32BWGNJGBVFBGJZS33GBHR4QVXR',
            secret: 'SCK562BILSJP3DIHTFQ3B3TCILNFDWPFLAKZ5L4H7R5NDCK5D2PQ5QPE',
        },
    };

    // const keys: IAccountKeys = {
    //     base: {
    //         address: 'GAHAFD4YPLUMNPRG7STAJRKC4YCKLDBXOUHZFPKP7CFU27URKTAONIQ7',
    //         secret: 'SCXDWM5SH6STUQTS2G3FJY5TTMPNIPDJWYQX2ZQUCRDBTYRWVZL3J52D',
    //     },
    //     pending: {
    //         address: 'GDIK35NOE7ZU7AUDZY4MZZQLGHE7SG4R6LCXN2VS3NQYTXLXE5EYY3KU',
    //         secret: 'SDO24Q2WDHXH7I6CUN674QGGN6KR7XLULHHBFNH67NWEIMNWXTP2KOT2',
    //     },
    // };

    test('Check is account keys stored properly', async (done) => {
        storage.saveAccountKeys(keys.base.address, keys);
        const response = await storage.getAccountKeys(keys.base.address);
        expect(response.base.secret).toBe(keys.base.secret);
        // expect(response.pending.secret).toBe(keys.pending.secret);
        // expect(response.pending.address).toBe(keys.pending.address);
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
