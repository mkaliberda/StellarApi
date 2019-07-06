import { Body, Get, JsonController, Param, Post } from 'routing-controllers';

import { IAccountKeys } from '../../lib/keys-storage/IStorage';
import { KeyStorageService } from '../services/KeyStorageService';

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
                secret: keys.basePrivate,
            },
            pending: {
                address: keys.pendingAddress,
                secret: keys.pendingPrivate,
            },
        };
        try {
            this.storeService.storeAccountKeys(keys.baseAddress, toStoreKeys);
            return ['Keys Saved'];
        } catch (error) {
            console.log('Error! =(', error);
            return ['Error'];
        }
    }
}
