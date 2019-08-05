import { IsNumber, IsOptional, IsString } from 'routing-controllers/node_modules/class-validator';

import { SYSTEM_ACCOUNTS } from '../../lib/stellar/StellarConst';

export class TransferParams {
    @IsString()
    public sender_acc: string;

    @IsString()
    public receiver_acc: string;

    @IsOptional()
    @IsString()
    public profit_acc: string;

    @IsNumber()
    public amount: number;

    @IsString()
    public asset: string;

    @IsOptional()
    @IsNumber()
    public fee: number;

    constructor(profit_acc: string = SYSTEM_ACCOUNTS.CORE_MAIN,
                fee: number = 0) {
        this.fee = fee;
        this.profit_acc = profit_acc;
    }
}
