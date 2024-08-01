import * as core from '@actions/core';
import {OUTPUT_NAME} from './utils';

const PR_WHICH_TRIGGERED_ACTION = core.getInput(OUTPUT_NAME.EVENT_PULL_REQUEST_INFO);

console.log('PR_WHICH_TRIGGERED_ACTION', PR_WHICH_TRIGGERED_ACTION);
