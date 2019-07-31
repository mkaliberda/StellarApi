import {
    IsBoolean, IsJSON, IsNumber, IsOptional
} from 'routing-controllers/node_modules/class-validator';

export class CreateWalletParams {

    @IsJSON()
    public assets: string;

    @IsOptional()
    @IsNumber()
    public balance: number;

    @IsOptional()
    @IsBoolean()
    public is_user: boolean;

    constructor(balance: number = 100,
                is_user: boolean = true) {
        this.balance = balance;
        this.is_user = is_user;
    }
}
