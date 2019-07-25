import { IsOptional, IsPositive, Max, Min } from 'routing-controllers/node_modules/class-validator';

export class HistoryTxParams {

    @IsOptional()
    @IsPositive()
    @Min(1)
    @Max(20)
    public limit: number;

    @IsOptional()
    @IsPositive()
    @Min(1)
    public page: number;

    constructor(limit: number = 10,
                page: number = 1) {
        this.limit = limit;
        this.page = page;
    }
}
