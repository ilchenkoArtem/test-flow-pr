export const FLOW_TYPES = ["feat", "change", "fix", "style", "refactor", "test", "docs", "revert", "chore", "hotfix"];
const FLOW_TYPES_OR_TEMPLATE = FLOW_TYPES.join("|");
const PR_TITLE_PATTERN = new RegExp(`^(${FLOW_TYPES_OR_TEMPLATE}):(.*)$`)
const PR_TITLE_PATTERN_WITH_TASKS = new RegExp(`^(${FLOW_TYPES_OR_TEMPLATE})\\((FL-\\d.*)\\):(.*)`)

export const isPullRequestTitleWithoutTaskNumbers = (title: string) => {
  return PR_TITLE_PATTERN.test(title)
}

export const isPullRequestTitleWithTaskNumbers = (title: string) => {
  return PR_TITLE_PATTERN_WITH_TASKS.test(title)
}

export const isValidPullRequestTitle = (title: string) => {
  return PR_TITLE_PATTERN.test(title) || PR_TITLE_PATTERN_WITH_TASKS.test(title)
}

/**
 * Use only after checking if the title is valid
 */
export const getTaskNumbers = (prTitle: string) => {
  return (prTitle.match(/FL-\d{4,}/gi) || []).map((taskNumber:string) => taskNumber.toUpperCase());
}

/**
 * Use only after checking if the title is valid
 */
export const getGitFlowType = (prTitle: string) => {
  return prTitle.split(":")[0].split("(")[0].replace(/\s/g, '');
}

/**
 * Use only after checking if the title is valid
 */
export const getTitleDescription = (prTitle: string) => {
  const [flowAndScope, ...description] = prTitle.split(/:/)
  return description.join(":").trim()
}
