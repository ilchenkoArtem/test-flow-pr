import {createMessage} from './Message';

export class TeamsNotification {
  private readonly webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  private errorHandling(error: unknown) {
    console.error("Error sending notification to Teams:", error);
    throw error;
  }

  async send(body: unknown) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };

    try {
      const response = await fetch(this.webhookUrl, options)
      const responseData = await response.json();

      if (!response.ok) {
        throw responseData;
      }
      console.info('Notification sent to Teams');
    } catch (e) {
      this.errorHandling(e);
    }
  }
}

const teamsNotification = new TeamsNotification(
  "https://prod2-05.germanywestcentral.logic.azure.com:443/workflows/0d96055dde764b19af0e7368a6d756f7/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=qZklgLiaC5XbFgHsT7ZqC-bsydY-4MPM7BxN9bBdqdY"
)

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
  assignedTo: [getTeamsMentionByGitUser('ilchenkoArtem')]
});

console.log('message', JSON.stringify(message, null, 2));

/*teamsNotification.send({
  "type": "message",
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": test,
    }
  ]
})*/

teamsNotification.send({
  "type": "message",
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": message
    }
  ]
})


