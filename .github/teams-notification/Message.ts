class MessageFactory {
  getCardRoot = (body: AdaptiveCardBodyItem[], actions: AdaptiveCardAction[]) => {
    return {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.4",
      body: [
        ...body,
        {
          type: "ActionSet",
          separator: true,
          actions,
          spacing: "medium",
        }
      ],
      msteams: {
        width: 'full',
        entities: [
          {
            type: "mention",
            text: `<at>Artem</at>`,
            mentioned: {
              id: "Artem Ilchenko",
              name: "artem.ilchenko@711media.de",
            }
          }
        ]
      }
    }
  }

  private getStatusColorByType = (type: CARD_TYPE) => {
    const mainColorByType: Record<CARD_TYPE, string> = {
      ERROR: "Attention",
      INFO: "Default",
      WARNING: "Warning",
    }

    return mainColorByType[type] || "Default";
  }

  private getTitlePrefixByType = (type: CARD_TYPE) => {
    const mainPrefixByType: Record<CARD_TYPE, string> = {
      ERROR: "[ERROR]",
      INFO: "[INFO]",
      WARNING: "[WARNING]",
    }

    return mainPrefixByType[type] || "[INFO]";
  }

  private getCardHeader = (title: string, type: CARD_TYPE): AdaptiveCardBodyItem[] => {
    return [
      {
        type: "TextBlock",
        spacing: "None",
        text: `${this.getTitlePrefixByType(type)} ${title}`,
        weight: "bolder",
        wrap: true,
        color: this.getStatusColorByType(type),
        separator: true,
      },
    ]
  }

  private getSimpleBodyMessage = (message: string): AdaptiveCardBodyItem => {
    return {
      type: "TextBlock",
      spacing: "medium",
      text: message,
      wrap: true,
      separator: true,
    }
  }

  public getCardBody = (body: string | AdaptiveCardBodyItem[]): AdaptiveCardBodyItem[] => {
    if (typeof body === "string") {
      return [this.getSimpleBodyMessage(body)];
    }
    return body;
  }

  public getTeamsMentions = (name: string, id: string): AdaptiveCardBodyItem => {
    return {
      type: "TextBlock",
      text: `<at>Artem</at>`,
      wrap: true,
      separator: true,
    }
  }

  public create = ({title, type, body, actions}: CreateModel) => {
    const cardHeader = this.getCardHeader(title, type);
    const cardBody = this.getCardBody(body);

    return this.getCardRoot([
      ...cardHeader,
      ...cardBody,
      this.getTeamsMentions("Artem", "")
    ], actions);
  }
}

type AdaptiveCardBodyItem = Record<string, any>
type AdaptiveCardAction = Record<string, any>

type CARD_TYPE = "ERROR" | "INFO" | "WARNING";

interface CreateModel {
  title: string;
  type: CARD_TYPE;
  /**
   * Set GitHub user logins to mention them in the message
   */
  assignedTo?: string[];
  body: string | AdaptiveCardBodyItem[];
  actions?: AdaptiveCardAction[];
}

export const createMessage = new MessageFactory().create;
