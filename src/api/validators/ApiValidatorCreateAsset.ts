import { IsOptional, IsNumber, IsString } from 'routing-controllers/node_modules/class-validator';
import { SYSTEM_ACCOUNTS } from '../../lib/stellar/StellarConst';

export class CreateAssetParams {

    @IsString()
    public asset_name: string;

    @IsOptional()
    @IsString()
    public from_acc: string;

    @IsOptional()
    @IsString()
    public to_acc: string;

    @IsNumber()
    public amount: number;

    constructor(from_acc: string = SYSTEM_ACCOUNTS.ROOT,
                to_acc: string = SYSTEM_ACCOUNTS.RS_MAIN) {
        this.from_acc = from_acc;
        this.to_acc = to_acc;
    }
}
