import { SYSTEM_ACCOUNTS } from '../src/lib/stellar/StellarConst';
import asyncForEach from '../src/lib/utils/AsyncForEach';
import { createChannelsForAccount } from './stellar-command';

const endPointArray = ['deposit', 'withdraw'];
const startBalance = 100;
// Create Core Main Account

asyncForEach(Object.keys(SYSTEM_ACCOUNTS), async (item) => {
    await createChannelsForAccount(item, endPointArray, startBalance);
    console.log('====================');
    console.log(item, 'DONE');
    console.log('====================');
});
