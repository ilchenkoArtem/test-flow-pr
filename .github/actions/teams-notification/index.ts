import {getEnv, getEnvJson, isValidJson} from '../../workflows/utils/helpers';
import {createMessage} from '.github/teams-notification/Message';
import {getTeamsMentionByGitUser, sendNotification} from '.github/teams-notification/utils';



const webhook = getEnv('WEBHOOK_URL');
const title = getEnv('TITLE')
const body = isValidJson(process.env.BODY) ? getEnvJson<Record<string, unknown>[]>("BODY") : getEnv('BODY')
const type = getEnv('TYPE', false)
const actions = getEnvJson<Record<string, unknown>[]>('ACTIONS', false)
const mentionList = getEnv('MENTION_LIST', false)?.split('|').map((mention) => mention.trim())

const message = createMessage({
  mentionList: getTeamsMentionByGitUser(mentionList || []),
  actions: actions || [],
  title,
  type: type || "INFO",
  body,
})

await sendNotification({
  webhook: webhook,
  message,
})



