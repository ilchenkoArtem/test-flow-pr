import * as core from '@actions/core';
import {getEnv, getEnvJson, isValidJson} from '../../workflows/utils/helpers';
import {createMessage} from '.github/teams-notification/Message';
import {getTeamsMentionByGitUser, sendNotification} from '.github/teams-notification/utils';



const webhook = getEnv('WEBHOOK_URL');
const title = getEnv('TITLE')
const body = isValidJson(process.env.BODY) ? getEnvJson<Record<string, unknown>[]>("BODY") : getEnv('BODY')
const type = getEnv('TYPE', false)
const actions = getEnvJson<Record<string, unknown>[]>('ACTIONS', false)
const mentionList = getEnv('MENTION_LIST', false)?.split('|').map((mention) => mention.trim())

core.debug(`Sending notification to Teams with webhook: ${webhook}`)
core.debug(`Title: ${title}`)
core.debug(`Body: ${body}`)
core.debug(`Type: ${type}`)
core.debug(`Actions: ${actions}`)
core.debug(`Mention list: ${mentionList}`)
core.debug(`Mention list: ${mentionList}`)


const message = createMessage({
  mentionList: getTeamsMentionByGitUser(mentionList || []),
  actions: actions || [],
  title,
  type: type?.toUpperCase() || "INFO",
  body,
})

core.startGroup("Message")
core.debug(JSON.stringify(message, null, 2))
core.endGroup()

await sendNotification({
  webhook: webhook,
  message,
})



