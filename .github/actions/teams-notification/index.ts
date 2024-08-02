import {getEnv, getEnvJson, isValidJson} from '../../workflows/utils/helpers';


const WEBHOOK_URL = getEnv('WEBHOOK_URL');
const BODY = isValidJson(process.env.BODY) ? getEnvJson<Record<string, unknown>[]>("BODY") : getEnv('BODY')
const TYPE = getEnv('TYPE', false)
const ACTIONS = getEnvJson<Record<string, unknown>[]>('ACTIONS', false)
const NOTIFY = getEnvJson<string[]>('NOTIFY', false)





console.log('WEBHOOK_URL', WEBHOOK_URL);
console.log('BODY', BODY);
console.log('TYPE', TYPE);
console.log('ACTIONS', ACTIONS);
console.log('NOTIFY', NOTIFY);



