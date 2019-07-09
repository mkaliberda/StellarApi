import { StellarTxManager } from '../src/lib/stellar/StellarTxManager';

const stellaTx = new StellarTxManager();
stellaTx.createAccount('100')
.then(res => {
    console.log(res);
});
console.log('DENCKICk!!!!!!!!!!');
