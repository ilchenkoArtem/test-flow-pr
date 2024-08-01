import {getInput} from '@actions/core';

const WEBHOOK_URL = getInput('webhook-url', {required: true});

console.log('WEBHOOK_URL', WEBHOOK_URL);


