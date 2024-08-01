import {getEnv} from '../../feature-auto-merge-to-develop/utils';

const WEBHOOK_URL = getEnv('webhook-url');
console.log('WEBHOOK_URL', WEBHOOK_URL);


