interface TeamsMention {
  name: string;
  id: string;
  /**
   * Type of the team member need for use in text with <at>{type}</at>
   */
  type: string;
}

const UNKNOWN_USER = {
  name: "Unknown",
  id: "Unknown",
  type: "Unknown"
} satisfies TeamsMention


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
  return githubUserName.map((name) => MAP[name]).filter(Boolean)
}
