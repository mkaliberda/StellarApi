import { IsNumber, IsOptional, IsString } from 'routing-controllers/node_modules/class-validator';

import { SYSTEM_ACCOUNTS } from '../../lib/stellar/StellarConst';

export class ExchangeParams {

    @IsString()
    public asset_from: string;

    @IsString()
    public asset_to: string;

    @IsString()
    public from_acc: string;

    @IsString()
    public to_acc: string;

    @IsOptional()
    @IsString()
    public profit_acc: string;

    @IsNumber()
    public amount_from: number;

    @IsNumber()
    public amount_to: number;

    @IsOptional()
    @IsNumber()
    public fee: number;

    @IsOptional()
    @IsNumber()
    public index: number;

    constructor(fee: number = 0,
                profit_acc: string = SYSTEM_ACCOUNTS.CORE_MAIN,
                index: number = 0) {
        this.profit_acc = profit_acc;
        this.fee = fee;
        this.index = index;
    }
}
