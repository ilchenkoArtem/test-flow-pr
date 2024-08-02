import {createMessage} from './Message';

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

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    console.log("Notification sent to Teams");
  } catch
    (error) {
    console.error("Error sending notification to Teams:", error);
    throw error;
  }
}


import {AdaptiveCard, TextBlock, ColumnSet, Column, Image, Version} from 'adaptivecards';
import {getTeamsMentionByGitUser} from './utils';

const adaptiveCard = new AdaptiveCard();
adaptiveCard.version = new Version(1, 4);
const title = new TextBlock();
title.text = "[ERROR] in the workflow";
title.style = "default";
title.color = 2;
title.weight = 2;
title.wrap = true;
title.size = 2;
title.spacing = 0;
title.separator = true;

// Author section
const authorSection = new ColumnSet();
authorSection.separator = true;

const logoColumn = new Column();
logoColumn.width = "auto";

/*const githubLogo = new Image();
githubLogo.url = "https://avatars.githubusercontent.com/in/15368?s=80&v=4";
githubLogo.size = 2;

logoColumn.addItem(githubLogo);

const authorColumn = new Column();
const authorText = new TextBlock();
authorText.text = "Add notification initiator here";
authorText.wrap = true;
authorText.size = 1;
authorText.weight = 2;*/


//authorColumn.addItem(authorText);

authorSection.addColumn(logoColumn);
//authorSection.addColumn(authorColumn);
// End of author section

adaptiveCard.addItem(title);
adaptiveCard.addItem(authorSection);

const test = adaptiveCard.toJSON();

//console.log('test', test);

const message = createMessage({
  type: "ERROR",
  title: "!!Error in the workflow",
  body: "This **is** a test message [test](https://www.google.com)",
  actions: [
    {
      type: "Action.OpenUrl",
      title: "Action.OpenUrl",
      url: "https://adaptivecards.io"
    }
  ],
  mentionList: getTeamsMentionByGitUser(['ilchenkoArtem', 'ny1am'])
});

console.log('message', JSON.stringify(message, null, 2));

sendNotification({
  webhook: "https://711mediade.webhook.office.com/webhookb2/b3ff7385-d875-466c-979d-c964b95740f3@040fc3ef-6a69-42af-86d9-98f35eaede44/IncomingWebhook/dc0777bb33dc48039ddfb38edf5016ec/54b9ed1d-26b3-4848-935c-368e666000a9",
  message: message
});


