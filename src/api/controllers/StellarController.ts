import { Body, Get, JsonController, Param, Post, QueryParams } from 'routing-controllers';

import { Address, StellarBaseResponse } from '../../lib/stellar/StellarPatterns';
import { StellarOperationsService } from '../services/StellarOperationsService';
import { IAccountBalancesGroup, StellarService } from '../services/StellarService';
import { BalanceParams } from '../validators/ApiValidatorBalance';
import { CreateAssetParams } from '../validators/ApiValidatorCreateAsset';
import { CreateWalletParams } from '../validators/ApiValidatorCreateWallet';
import { DepositWithdrawParams } from '../validators/ApiValidatorDepositWithdraw';
import { ExchangeParams } from '../validators/ApiValidatorExchange';
import { HistoryTxParams } from '../validators/ApiValidatorHistoryTx';
import { HoldParams } from '../validators/ApiValidatorHold';
import { TransferParams } from '../validators/ApiValidatorTransfer';
import { TrustWalletParams } from '../validators/ApiValidatorTrustWallet';

@JsonController('/wallet')
export class StellarController {

    constructor(private stellarService: StellarService,
                private stellarOperationService: StellarOperationsService) {
    }

    @Get('/balance/:address')
    public async balance(@Param('address') address: string, @QueryParams() payloads: BalanceParams): Promise<IAccountBalancesGroup> {
        /**
         * Account balance.
         * Show balances in native view if no optional arguments passed.
         * @route /api/wallet/balance/:address
         * @param {string} address - Account address.
         * @param {array} [assets] - Array of assets to show.
         * @param {string} [include_pending=false] - If true show balance of pending account.
         * @returns {array} - Array of account balances.
         */
        return await this.stellarService.getAccountBalance(address, payloads);
    }

    @Get('/tx-history/:address')
    public async history(@Param('address') address: string, @QueryParams() payloads: HistoryTxParams): Promise<IAccountBalancesGroup> {
        /**
         * Account balance.
         * Show balances in native view if no optional arguments passed.
         * @route /api/wallet/balance/:address
         * @param {string} address - Account address.
         * @param {number} [limit=10] - Limit tx per page max 30 min 1
         * @param {string} [page=1] - Pagination page
         * @returns {array} - Array of tx.
         */
        return await this.stellarService.getTxHistory(address, payloads.limit, payloads.page);
    }

    @Post('/create')
    public async createWallet(@Body() params: CreateWalletParams): Promise<Address> {
        /**
         * Create wallet.
         * Create wallet with trust to following assets.
         * @route /api/wallet/create
         * @param {array} assets - Assets array. (JSON?).
         * @param {number} [balance=100] - Init balance. Optional. Default = 10 XLM.
         * @param {bool} [is_user=true] - Wallet type. true - user wallet, false - external service wallet.
         * @returns  {string} - Return public address of new wallet.
         */
        return await this.stellarService.createWallet(JSON.parse(params.assets), params.is_user, params.balance);
    }

    @Post('/deposit')
    public async deposit(@Body() params: DepositWithdrawParams): Promise<StellarBaseResponse[]> {
        /**
         * Deposit.
         * Deposit operation. While process this operation we make three transactions.
         * First we send credit money (ex. DIMOc) from reserve system account (RS) to user account {user_acc} in amount = {amount} - {fee}.
         * Second we send credit money from RS to profit account {profit_acc} in amount = {fee}.
         * Third we send debit money from RS to external service account {service_acc} in amount = {amount}.
         * @route /api/wallet/deposit
         * @param {string} user_acc - User wallet address.
         * @param {string} [service_acc=CORE_SERVICE] - External service account address.
         * @param {string} [profit_acc=CORE_MAIN] - Account for profit aggregation. Optional
         * @param {number} amount - Amount.
         * @param {number} [fee=0] - Profit amount for current operation. Optional
         * @param {string} asset - Currency. Without 'c' or 'd' suffix. (ex. DIMO)
         * @param {number} [index=0] - Index of the channels Array
         * @returns {array} Array of stellar transactions reference (th_hash, ledger, etc.).
         */
        return this.stellarOperationService.depositOperation(params);
    }

    @Post('/hold/:address')
    public async holdMoney(@Param('address') user: string, @Body() params: HoldParams): Promise<any> {
        /**
         * Hold money.
         * Holding {amount} of {asset} in user pending account. Work only with credit money.
         * @route /api/wallet/hold/:address
         * @param {string} address - User wallet address.
         * @param {string} asset - Holding asset. Without 'c' or 'd' suffix. (ex. DIMO)
         * @param {number} amount - Holding money amount.
         * @param {bool} [reverse=false] - Hold direction. true - [pending => base], false - [base => pending]
         * @returns {array} Array of stellar transactions reference (th_hash, ledger, etc.).
         */
        return this.stellarOperationService.holdOperation(user, params);
    }

    @Post('/withdraw')
    public async withdraw(@Body() params: DepositWithdrawParams): Promise<StellarBaseResponse[]> {
        /**
         * Withdraw.
         * Withdraw operation. While process this operation we make three transactions.
         * First we send credit money (ex. DIMOc) from user account {user_acc} (pending sub account) to reserve system (RS) in amount = {amount} - {fee}.
         * Second we send credit money from user account {user_acc} (pending sub account) to profit account {profit_acc} in amount = {fee}.
         * Third we send debit money from service account {service_acc} to RS in amount = {amount}.
         * @route /api/wallet/withdraw
         * @param {string} user_acc - User wallet address
         * @param {string} [service_acc=CORE_SERVICE] - External service account address.
         * @param {string} [profit_acc=CORE_MAIN] - Account for profit aggregation. Optional
         * @param {number} amount - Amount.
         * @param {number} [fee=0] - Profit amount for current operation. Optional
         * @param {string} asset - Currency. Without 'c' or 'd' suffix. (ex. DIMO)
         * @param {number} [index=0] - Index of the channels Array
         * @returns {array} Array of stellar transactions reference (th_hash, ledger, etc.).
         */
        return this.stellarOperationService.withdrawOperation(params);
    }

    @Post('/transfer')
    public async transfer(@Body() params: TransferParams): Promise<StellarBaseResponse[]> {
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
        return this.stellarOperationService.transferOperation(params);
    }

    @Post('/exchange')
    public async exchange(@Body() params: ExchangeParams): Promise<StellarBaseResponse[]> {
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
         * @param {number} [index=0] - Index of the channels Array
         * @returns {array} Array of stellar transactions reference (th_hash, ledger, etc.).
         */
        return this.stellarOperationService.exchangeOperation(params);
    }

    @Post('/create-asset')
    public async createAsset(@Body() params: CreateAssetParams): Promise<StellarBaseResponse[]> {
        /**
         * Create asset and fund to account.
         * For standard operation its create
         * asset from ROOT, and Trust and fund to RS
         * @route /api/wallet/create-asset
         * @param {string} asset_name - Symbol like BTC, DIMO
         * @param {string} [from_acc='ROOT'] - Owner account
         * @param {string} [to_acc='RS'] - Receive account
         * @param {number} amount - Accept Amount
         */
        return this.stellarOperationService.createAsset(params);
    }

    @Post('/trust')
    public async trustWallet(@Body() params: TrustWalletParams): Promise<string[]> {
        /**
         * Trust from the one account to another following assets.
         * @route /api/wallet/create
         * @param {array} assets - Assets array. (JSON?).
         * @param {string} from_acc - Wallet address.
         * @param {string} [to_acc='ROOT'] - Trust to account
         * @param {bool} [is_user=true] - Wallet type. true - user wallet, false - external service wallet.
         * @returns {string} - Return public address of new wallet.
         */
        return await this.stellarOperationService.trustWallet(JSON.parse(params.assets), params.from_acc, params.to_acc, params.is_user);
    }

}
