import { IsOptional, IsNumber, IsString } from 'routing-controllers/node_modules/class-validator';

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

    constructor(profit_acc: string = '',
                fee: number = 0) {
        this.fee = fee;
        this.profit_acc = profit_acc;
    }
}
