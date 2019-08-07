import { CHANNELS_ROUTER, SYSTEM_ACCOUNTS } from '../src/lib/stellar/StellarConst';
import asyncForEach from '../src/lib/utils/AsyncForEach';
import { createChannelsForAccount } from './stellar-command';

const endPointArray = [CHANNELS_ROUTER.DEPOSIT, CHANNELS_ROUTER.WITHDRAW, CHANNELS_ROUTER.EXCHANGE];
const startBalance = 10000;
const countUp = 5;
// Create Core Main Account

asyncForEach(Object.keys(SYSTEM_ACCOUNTS), async (item) => {
    await createChannelsForAccount(item, endPointArray, startBalance, countUp);
    console.log('====================');
    console.log(item, 'DONE');
    console.log('====================');
});
