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
      ]
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
      {
        type: "TextBlock",
        spacing: "None",
        wrap: true,
        text: "Assigned to: [artem.ilchenko@711media.de](email:artem.ilchenko@711media.de)",
        size: 'small',
      }
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

  public getTeamsMention = (name: string, id: string): AdaptiveCardBodyItem => {
    return {
      type: "TextBlock",
      text: `<at>${name}</at>`,
      wrap: true,
      separator: true,
      msteams: {
        entities: [
          {
            type: "mention",
            text: `<at>${name}</at>`,
            mentioned: {
              id,
              name,
            }
          }
        ]
      }
    }
  }

  public create = ({title, type, body, actions}: CreateModel) => {
    const cardHeader = this.getCardHeader(title, type);
    const cardBody = this.getCardBody(body);

    return this.getCardRoot([
      ...cardHeader,
      ...cardBody,
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
