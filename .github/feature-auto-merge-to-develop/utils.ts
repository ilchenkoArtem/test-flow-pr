export const getTaskNumbers = (prTitle: string) => {
  return (prTitle.match(/FL-\d{4,}/gi) || []).map((taskNumber:string) => taskNumber.toUpperCase());
}

export const getGitFlowType = (prTitle: string) => {
  return prTitle.split(":")[0].split("(")[0].replace(/\s/g, '');
}

export const mergeTitle = (prevPrTitle: string, nextPrTitle: string) => {
  const prevTaskNumbers = getTaskNumbers(prevPrTitle);
  const nextTaskNumbers = getTaskNumbers(nextPrTitle);
  const prevPrHasTaskNumbers = prevTaskNumbers.length > 0;
  const nextPrHasTaskNumbers = nextPrTitle.length > 0;

  if ((!prevPrHasTaskNumbers && !nextPrHasTaskNumbers) || !nextPrHasTaskNumbers) {
    return prevPrTitle;
  }

  const mergedTaskNumbers = Array.from(new Set([...prevTaskNumbers, ...nextTaskNumbers]));
}

export const replaceTaskNumbers = (mainPullRequest: string, fixPullRequest: string[]) => {
  const [taskInfo, ...title] = mainPullRequest.split(":");
  const gitFlowType = taskInfo.split("(")[0].replace(/\s/g, '');
  const taskNumbers = getTaskNumbers(gitFlowType);
}
