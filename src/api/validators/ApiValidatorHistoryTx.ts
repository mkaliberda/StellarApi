import { IsOptional } from 'routing-controllers/node_modules/class-validator';

export class HistoryTxParams {

    @IsOptional()
    public limit: string;

    @IsOptional()
    public page: string;

    constructor(limit: string = '10',
                page: string = '1') {
        this.limit = limit;
        this.page = page;
    }
}
