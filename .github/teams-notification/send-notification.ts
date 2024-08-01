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
      body: JSON.stringify({
        text: body,
      }),
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
  'https://prod2-30.germanywestcentral.logic.azure.com:443/workflows/6e6371735cb449ca98deae3df1730ee7/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=o_bUsM_SQyVRaSp1Ddr3HmQzI1uH4AkvhdeCiixL_uo'
)

teamsNotification.send({
  "type": "message",
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": {
        "type": "AdaptiveCard",
        "body": [
          {
            "type": "TextBlock",
            "text": "Hi <at>{USER-A-NAME}</at> <at>{USER-B-NAME}</at> Woo, workflows!"
          }
        ],
        "$schema": "https://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.0",
        "msteams": {
          "entities": [
            {
              "type": "mention",
              "text": "<at>{USER-A-NAME}</at>",
              "mentioned": {
                "id": "{TEAMS-A-USER-KEY}",
                "name": "{USER-A-NAME}"
              }
            },
            {
              "type": "mention",
              "text": "<at>{USER-B-NAME}</at>",
              "mentioned": {
                "id": "{TEAMS-B-USER-KEY}",
                "name": "{USER-B-NAME}"
              }
            }
          ]
        }
      }
    }
  ]
})
