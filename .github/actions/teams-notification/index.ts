import {getEnv, getEnvJson, isValidJson} from '../../workflows/utils/helpers';


const WEBHOOK_URL = getEnv('WEBHOOK_URL');
const BODY = isValidJson(process.env.BODY) ? getEnvJson<Record<string, unknown>[]>("BODY") : getEnv('BODY')
const TYPE = getEnv('TYPE', false)
const ACTIONS = getEnvJson<Record<string, unknown>[]>('ACTIONS', false)
const MENTION_LIST = getEnv('MENTION_LIST', false)?.split('|').map((mention) => mention.trim())





console.log('WEBHOOK_URL', WEBHOOK_URL);
console.log('BODY', BODY);
console.log('TYPE', TYPE);
console.log('ACTIONS', ACTIONS);
console.log('MENTION_LIST', MENTION_LIST);



