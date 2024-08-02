import * as core from '@actions/core';

interface TeamsMention {
  name: string;
  id: string;
  /**
   * Type of the team member need for use in text with <at>{type}</at>
   */
  type: string;
}

const FRONT_TEAM_MENTIONS = {
  ARTEM_IlCHENKO: {
    name: "Artem Ilchenko",
    id: "artem.ilchenko@711media.de",
    type: "ArtemIlchenko"
  },
  NAZAR_YAVNYY: {
    name: "Nazar Yavnyy",
    type: "NazarYavnyy",
    id: "nazar.yavnyy@flogintra.ch",
  }
} satisfies Record<string, TeamsMention>


export const getTeamsMentionByGitUser = (githubUserName: string[]):TeamsMention[] => {
  const MAP = {
    "ilchenkoArtem": FRONT_TEAM_MENTIONS.ARTEM_IlCHENKO,
    "nazar-futurelog": FRONT_TEAM_MENTIONS.NAZAR_YAVNYY,
    "ny1am": FRONT_TEAM_MENTIONS.NAZAR_YAVNYY,
  }
  // return only valid mentions, if set not valid, notification will not be sent
  return githubUserName.map((name) => {
    const mention = MAP[name]

    if (!mention) {
      core.warning(`Mention for ${name} not found. Please update user map` )
    }

    return mention
  }).filter(Boolean)
}

interface SendNotificationArgs {
  webhook: string;
  message: unknown;
}
export const sendNotification = async ({message, webhook}: SendNotificationArgs) => {
  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "type": "message",
        "attachments": [
          {
            "contentType": "application/vnd.microsoft.card.adaptive",
            "content": message
          }
        ]
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.log("responseData", responseData)
      throw new Error('Failed to send notification');
    }

    console.log("Notification sent to Teams");
  } catch
    (error) {
    console.error("Error sending notification to Teams:", error);
    throw error;
  }
}

