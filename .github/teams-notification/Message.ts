class MessageFactory {
  getCardRoot = ({actions, assignedTo, body}: CreateRootModel) => {
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
      msteams: this.getCardMsteams(assignedTo),
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
        spacing: "none",
        text: `${this.getTitlePrefixByType(type)} ${title}`,
        weight: "bolder",
        wrap: true,
        color: this.getStatusColorByType(type),
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

  private getCardBody = (body: string | AdaptiveCardBodyItem[]): AdaptiveCardBodyItem[] => {
    if (typeof body === "string") {
      return [this.getSimpleBodyMessage(body)];
    }
    return body;
  }

  private getAssignedTo = (mention?: AdaptiveCardTeamMention[]): AdaptiveCardBodyItem[] => {
    if (!mention || !mention.length) {
      return [];
    }

    return [
      {
        type: "TextBlock",
        text: `@: ${mention.map(({type}) => `<at>${type}</at>`).join(", ")}`,
        wrap: true,
        spacing: "none",
        size: "small",
        color: "light"
      }
    ]
  }

  public getCardMsteams = (mention: AdaptiveCardTeamMention[] | undefined) => {
    if (!mention || !mention.length) {
      return null;
    }

    return {
      entities: mention.map(({name, id, type}) => ({
        type: "mention",
        text: `<at>${type}</at>`,
        mentioned: {
          id,
          name,
        }
      }))
    }
  }

  public create = ({title, type, body, actions, assignedTo}: CreateModel) => {
    const cardHeader = this.getCardHeader(title, type);
    const cardBody = this.getCardBody(body);
    const cardAssignedTo = this.getAssignedTo(assignedTo);

    return this.getCardRoot({
      body: [
        ...cardHeader,
        ...cardAssignedTo,
        ...cardBody,
      ],
      assignedTo,
      actions
    });
  }
}

type AdaptiveCardBodyItem = Record<string, any>
type AdaptiveCardAction = Record<string, any>
type AdaptiveCardTeamMention = {
  name: string;
  id: string;
  /**
   * Type of the team member need for use in text with <at>{type}</at>
   */
  type: string;
}

type CARD_TYPE = "ERROR" | "INFO" | "WARNING";

interface CreateModel {
  title: string;
  type: CARD_TYPE;
  /**
   * Set GitHub user logins to mention them in the message
   */
  assignedTo?: AdaptiveCardTeamMention[];
  body: string | AdaptiveCardBodyItem[];
  actions?: AdaptiveCardAction[];
}

interface CreateRootModel {
  body: AdaptiveCardBodyItem[];
  actions: AdaptiveCardAction[];
  assignedTo?: AdaptiveCardTeamMention[];
}

export const createMessage = new MessageFactory().create;
