import { Body, Get, JsonController, Param, Post } from 'routing-controllers';
import { KeyStorageService } from '../services/KeyStorageService';
import { IAccountKeys } from '../../lib/keys-storage/IStorage';

@JsonController('/store')
export class StellarController {

    constructor(private storeService: KeyStorageService) {
    }

    @Get('/get-secret/:address')
    public getSecret(@Param('address') address: string): IAccountKeys {
        return this.storeService.getAccountKeys(address);
    }

    @Post('/put-secret')
    public storeSecret(@Body() keys: any): string[] {
        const toStoreKeys: IAccountKeys = {
            base: {
                address: keys.baseAddress,
                private: keys.basePrivate,
            },
            pending: {
                address: keys.pendingAddress,
                private: keys.pendingPrivate,
            },
        };
        try {
            this.storeService.storeAccountKeys(toStoreKeys);
            return ['Keys Saved'];
        } catch (error) {
            console.log('Error! =(', error);
            return ['Error'];
        }
    }
}
