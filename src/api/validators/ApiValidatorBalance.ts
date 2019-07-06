import { IsArray, IsOptional, IsBooleanString } from 'routing-controllers/node_modules/class-validator';

export class BalanceParams {

    @IsOptional()
    @IsArray()
    public assets: string[];

    @IsOptional()
    @IsBooleanString()
    public include_pending: string;

    constructor(include_pending: string = 'false') {
        this.include_pending = include_pending;
    }
}
