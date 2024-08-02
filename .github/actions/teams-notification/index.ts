import * as github from '@actions/github';
import {getEnv} from '../../workflows/utils/helpers';
const WEBHOOK_URL = getEnv('WEBHOOK_URL');
const TYPE = getEnv('TYPE');

console.log('context', github.context);
console.log('context.actor', github.context.actor);
console.log('context.actor', github.context.actor);

