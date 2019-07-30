import { setConnection } from 'typeorm-seeding';

import { bootstrapApp } from './bootstrap';

export const prepareServer = async (options?: { migrate: boolean }) => {
    const settings = await bootstrapApp();
    setConnection(settings.connection);
    return settings;
};
