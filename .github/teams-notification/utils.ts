export const getTeamsMentionByGitUser = (githubUserName: string) => {
  const MAP = {
    "ilchenkoArtem": {
      name: "Artem Ilchenko",
      id: "artem.ilchenko@711media.de"
    }
  }

  return MAP[githubUserName] || null;
}
