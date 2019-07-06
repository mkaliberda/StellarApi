import { Get, JsonController, Param, Params, Post } from 'routing-controllers';
import { StellarService } from '../services/StellarService';

@JsonController('/wallet')
export class StellarController {

    constructor(private stellarService: StellarService) {
    }

    @Get('/balance/:address')
    public async balance(@Param('address') address: string): Promise<any> {
        /**
         * Account balance.
         * Show balances in native view if no optional arguments passed.
         * @route /api/wallet/balance/:address
         * @param {string} address - Account address.
         * @param {array} [assets] - Array of assets to show.
         * @param {bool} [include_pending=false] - Array of assets to show.
         * @returns {array} - Array of account balances.
         */
        let balance: any;
        balance = await this.stellarService.getAccountBalance(address);

        return balance;
    }

    @Post('/create')
    public async createWallet(@Params() params: object): Promise<any> {
        /**
         * Create wallet.
         * Create wallet with trust to following assets.
         * @route /api/wallet/create
         * @param {array} assets - Assets array. (JSON?).
         * @param {number} [balance=10] - Init balance. Optional. Default = 10 XLM.
         * @param {bool} [is_user=true] - Wallet type. true - user wallet, false - external service wallet.
         * @returns {string} - Return public address of new wallet.
         */
        return 'address';
    }

    @Post('/deposit')
    public async deposit(@Params() params: object): Promise<any> {
        /**
         * Deposit.
         * Deposit operation. While process this operation we make three transactions.
         * First we send credit money (ex. DIMOc) from reserve system account (RS) to user account {user_acc} in amount = {amount} - {fee}.
         * Second we send credit money from RS to profit account {profit_acc} in amount = {fee}.
         * Third we send debit money from RS to external service account {service_acc} in amount = {amount}.
         * @route /api/wallet/deposit
         * @param {string} user_acc - User wallet address.
         * @param {string} service_acc - External service account address.
         * @param {string} [profit_acc] - Account for profit aggregation. Optional
         * @param {number} amount - Amount.
         * @param {number} [fee=0] - Profit amount for current operation. Optional
         * @param {string} asset - Currency. Without 'c' or 'd' suffix. (ex. DIMO)
         * @returns {array} Array of stellar transactions reference (th_hash, ledger, etc.).
         */
        return 'Ok';
    }

    @Post('/hold/:address')
    public async holdMoney(@Param('address') user: string, @Params() params: object): Promise<any> {
        /**
         * Hold money.
         * Holding {amount} of {asset} in user pending account. Work only with credit money.
         * @route /api/wallet/hold/:address
         * @param {string} address - User wallet address.
         * @param {string} asset - Holding asset.
         * @param {number} amount - Holding money amount.
         * @param {bool} [reverse=false] - Hold direction. true - [pending => base], false - [base => pending]
         * @returns {array} Array of stellar transactions reference (th_hash, ledger, etc.).
         */
        return 'Ok';
    }

    @Post('/withdraw')
    public async withdraw(@Params() params: object): Promise<any> {
        /**
         * Withdraw.
         * Withdraw operation. While process this operation we make three transactions.
         * First we send credit money (ex. DIMOc) from user account {user_acc} (pending sub account) to reserve system (RS) in amount = {amount} - {fee}.
         * Second we send credit money from user account {user_acc} (pending sub account) to profit account {profit_acc} in amount = {fee}.
         * Third we send debit money from service account {service_acc} to RS in amount = {amount}.
         * @route /api/wallet/withdraw
         * @param {string} user_acc - User wallet address
         * @param {string} service_acc - External service account address.
         * @param {string} [profit_acc] - Account for profit aggregation. Optional
         * @param {number} amount - Amount.
         * @param {number} [fee=0] - Profit amount for current operation. Optional
         * @param {string} asset - Currency. Without 'c' or 'd' suffix. (ex. DIMO)
         * @returns {array} Array of stellar transactions reference (th_hash, ledger, etc.).
         */
        return 'Ok';
    }

    @Post('/transfer')
    public async transfer(@Params() params: object): Promise<any> {
        /**
         * Transfer money.
         * Send money from {sender_acc} to {receiver_acc} in amount {amount}.
         * Operation process in two part.
         * First we send money from {sender_acc} to {profit_acc} (if exists) in amount {fee}
         * Second we send money from {sender_acc} to {receiver_acc} in amount {amount} - {fee}
         * @route /api/wallet/transfer
         * @param {string} sender_acc - User wallet address
         * @param {string} receiver_acc - Receiver wallet address.
         * @param {string} [profit_acc] - Account for profit aggregation. Optional
         * @param {number} amount - Amount.
         * @param {number} [fee=0] - Profit amount for current operation. Optional
         * @param {string} asset - Currency. Without 'c' or 'd' suffix. (ex. DIMO)
         * @returns {array} Array of stellar transactions reference (th_hash, ledger, etc.).
         */
        return 'Ok';
    }

    @Post('/exchange')
    public async exchange(@Params() params: object): Promise<any> {
        /**
         * Exchange money.
         * Exchange {amount_from} money to {amount_to} money.
         * First send {asset_from} money from {from_acc} to {to_acc} in amount {amount_from} - {fee}
         * Second send {asset_from} money from {from_acc} to {profit_acc} in amount {fee}
         * Third send {asset_to} money from {to_acc} to {from_acc} in amount {amount_to}
         * Work only with credit money.
         * @route /api/wallet/exchange
         * @param {string} asset_from - Spend asset
         * @param {string} asset_to - Receive asset
         * @param {string} from_acc - Spend account
         * @param {string} to_acc - Receive account
         * @param {string} [profit_acc] - Profit account
         * @param {number} amount_from - Spend amount
         * @param {number} amount_to - Receive amount
         * @param {number} [fee=0] - Fee amount
         * @returns {array} Array of stellar transactions reference (th_hash, ledger, etc.).
         */
        return 'Ok';
    }

    // @Get('/test')
    // public test(@QueryParams() payloads: any): any {
    //     return payloads;
    // }

    // @Post('/createWallet')
    // public async createWallet(): Promise<void> {
    //     let response: any;
    //     response = await this.stellarService.createWallet();
    // }

    // @Post('/put-secret')
    // public storeSecret(@Body() keys: any): string[] {
    //     const toStoreKeys: IAccountKeys = {
    //         base: {
    //             address: keys.baseAddress,
    //             private: keys.basePrivate,
    //         },
    //         pending: {
    //             address: keys.pendingAddress,
    //             private: keys.pendingPrivate,
    //         },
    //     };
    //     try {
    //         this.storeService.storeAccountKeys(keys.baseAddress, toStoreKeys);
    //         return ['Keys Saved'];
    //     } catch (error) {
    //         return ['Error'];
    //     }
    // }
}
