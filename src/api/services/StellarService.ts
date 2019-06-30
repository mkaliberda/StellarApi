import { Service } from 'typedi';

@Service()
export class StellarService {

    public static getBalance(address: string): string[] {
        return [address, address];
    }
}
