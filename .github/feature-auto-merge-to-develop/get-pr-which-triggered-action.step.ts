import * as core from '@actions/core';
import {getOctokit, exitWithError, BASE_REQUEST_DATA, getEnv} from './utils';


export const getPrWhichTriggeredActionStep = async () => {
  const MERGED_PR_NUMBER = getEnv("PR_NUMBER");

  const octokit = getOctokit();

  core.info(`Getting merged pull request info...`);
  const {data: triggerPullRequest} = await octokit.rest.pulls.get({
    ...BASE_REQUEST_DATA,
    pull_number: parseFloat(MERGED_PR_NUMBER),
  });

  if (!triggerPullRequest) {
    exitWithError(`Pull request #${MERGED_PR_NUMBER} is not found`);
  }

  core.startGroup(`Info:`);
  core.info(`URL: ${triggerPullRequest.html_url}`);
  core.info(`Title: ${triggerPullRequest.title}`);
  core.info(`Merged at: ${new Date(triggerPullRequest.merged_at).toLocaleDateString()}`);
  core.endGroup();

  return triggerPullRequest;
}



