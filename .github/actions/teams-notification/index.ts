
import * as github from '@actions/github';
import {getEnv} from '../../feature-auto-merge-to-develop/utils';

const WEBHOOK_URL = getEnv('WEBHOOK_URL');
console.log('WEBHOOK_URL', WEBHOOK_URL);

console.log('context', github.context);
console.log('context.actor', github.context.actor);
console.log('context.actor', github.context.actor);

