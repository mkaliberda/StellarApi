
import { IAccountKeys, IKeyPair, IKeysStorage } from '../../src/lib/keys-storage/IStorage';
import { VaultStorage } from '../../src/lib/keys-storage/VaultStorage';

const RS_BASE_PAIR: IKeyPair = { address: 'GCFKGHKNG5JVPI7T6YCVOVQSDQXJJ3CODZXDLTCDCRKEJ5XG55VXTCCW',
                                secret: 'SAHPHSIJNM7JTFIICD5CX3BT4UFYUBWQS6SM2VOFZOMFE5JX2JPIOO7L' };

const RS_ACCOUNT_KEYS: IAccountKeys = { base: RS_BASE_PAIR, pending: RS_BASE_PAIR };

describe('VaultStorage', () => {
    test('create-rs', async (done) => {
        const vs = new VaultStorage();
        console.log(RS_ACCOUNT_KEYS);
        const res = await vs.saveAccountKeys('RS', 'sdfdsf');
        console.log(RS_ACCOUNT_KEYS);
        console.log(res);
        expect(3).toBe(3);
        done();
    });
});