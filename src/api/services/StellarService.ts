import { Service } from 'typedi';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { StellarAccountManager } from '../../lib/stellar/StellarAccountManager';
import { Address } from '../../lib/stellar/StellarPatterns';

@Service()
export class StellarService {

    constructor(
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public getAccountBalance(account: Address): Promise<any> {
        const manager = new StellarAccountManager();
        this.log.info(`Get balance of user ${account}`);
        return manager.getBalances(account);
    }
}
