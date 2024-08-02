import * as core from '@actions/core';
import {exitWithError, getOctokit, BASE_REQUEST_DATA} from './utils';
import {PullRequest} from './types';

export const getLastMergedPrStep = async (triggerPullRequest: PullRequest) => {
  const octokit = getOctokit();
  const baseBranch = triggerPullRequest.base.ref;

  /* --------------------- Get last merged pull request info --------------------- */
  core.startGroup(`Last merged pull request info:`);
  core.info(`Fetching pull requests merged into develop from ${baseBranch}...`);
  const {data: closedPullRequestsByHeadBranch} = await octokit.rest.pulls.list({
    ...BASE_REQUEST_DATA,
    state: 'closed',
    head: `${BASE_REQUEST_DATA.owner}:${baseBranch}`,
    base: "develop",
    sort: "created",
    direction: "desc",
    per_page: 10,
  });

  if (closedPullRequestsByHeadBranch.length === 0) {
    core.notice(`No pull requests found for ${baseBranch}. Skipping...`);
    process.exit()
  }

  const mergedPullRequestsByHeadBranch = closedPullRequestsByHeadBranch.filter(
    (pr) => !!pr.merged_at && pr.number !== triggerPullRequest.number
  );

  if (mergedPullRequestsByHeadBranch.length === 0) {
    core.notice(`No merged pull requests found for ${baseBranch}. Skipping...`);
    process.exit()
  }

  const parentPullRequest = mergedPullRequestsByHeadBranch[0];

  core.info(`URL: ${parentPullRequest.html_url}`);
  core.info(`Title: ${parentPullRequest.title}`);
  core.info(`Merged at: ${new Date(parentPullRequest.merged_at).toLocaleDateString()}`);
  core.info(`Merge commit SHA: ${parentPullRequest.merge_commit_sha}`);
  core.info(`Merged to branch: ${parentPullRequest.base.ref}`);
  core.endGroup()

  if (!parentPullRequest.merge_commit_sha) {
    exitWithError(`Merge commit SHA is not found for the last merged pull request`);
  }

  return parentPullRequest;
}
