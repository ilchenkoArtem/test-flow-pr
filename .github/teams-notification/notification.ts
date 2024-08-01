class Notification {
  private getRoot ({body: unknown}) {
    return  (
      {
        "type": "message",
        "attachments": [
          {
            "contentType": "application/vnd.microsoft.card.adaptive",
            "content": {
              "version": "1.0",
              "$schema": "https://adaptivecards.io/schemas/adaptive-card.json",
              "type": "AdaptiveCard",
              "body": [
                {
                  "type": "TextBlock",
                  "text": "Hi <at>{USER-A-NAME}</at> <at>{USER-B-NAME}</at> Woo, workflows!"
                }
              ],
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
      }
    )
  }

  return build () {

  }
}
