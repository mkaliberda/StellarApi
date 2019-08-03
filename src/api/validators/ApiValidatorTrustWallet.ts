import {
    IsBoolean, IsJSON, IsOptional, IsString
} from 'routing-controllers/node_modules/class-validator';

import { SYSTEM_ACCOUNTS } from '../../lib/stellar/StellarConst';

export class TrustWalletParams {

    @IsJSON()
    public assets: string;

    @IsString()
    public from_acc: string;

    @IsString()
    public to_acc: string;

    @IsOptional()
    @IsBoolean()
    public is_user: boolean;

    constructor(to_acc: string = SYSTEM_ACCOUNTS.ROOT,
                is_user: boolean = true) {
        this.to_acc = to_acc;
        this.is_user = is_user;
    }
}
