import {getEnv} from './utils';

const PR_WHICH_TRIGGERED_ACTION = getEnv("PR_WHICH_TRIGGERED_ACTION");

console.log('PR_WHICH_TRIGGERED_ACTION', PR_WHICH_TRIGGERED_ACTION);
