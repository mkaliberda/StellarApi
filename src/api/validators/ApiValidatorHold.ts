import { IsOptional, IsNumber, IsString, IsBoolean } from 'routing-controllers/node_modules/class-validator';

export class HoldParams {

    @IsString()
    public asset: string;

    @IsNumber()
    public amount: number;

    @IsOptional()
    @IsBoolean()
    public reverse: boolean;

    constructor(reverse: boolean = false) {
        this.reverse = reverse;
    }
}
