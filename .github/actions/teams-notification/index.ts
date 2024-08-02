
import {context} from '@actions/github';
import {getEnv} from '../../feature-auto-merge-to-develop/utils';

const WEBHOOK_URL = getEnv('WEBHOOK_URL');
console.log('WEBHOOK_URL', WEBHOOK_URL);

console.log('context', context);
console.log('context.actor', context.actor);


