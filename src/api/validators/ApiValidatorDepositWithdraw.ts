import { IsOptional, IsNumber, IsString } from 'routing-controllers/node_modules/class-validator';

export class DepositWithdrawParams {

    @IsString()
    public user_acc: string;

    @IsString()
    public service_acc: string;

    @IsOptional()
    @IsString()
    public profit_acc: string;

    @IsNumber()
    public amount: number;

    @IsOptional()
    @IsNumber()
    public fee: number;

    @IsString()
    public asset: string;

    constructor(fee: number = 0,
                profit_acc: string = '') {
        this.fee = fee;
        this.profit_acc = profit_acc;
    }
}
