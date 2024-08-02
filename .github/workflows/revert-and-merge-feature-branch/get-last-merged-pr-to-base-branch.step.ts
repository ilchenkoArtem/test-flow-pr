import { getOctokit, exitWithError, getEnvJson} from './utils/helpers';
import * as core from '@actions/core';
import * as github from '@actions/github';
import {PullRequest} from './types';

const prWhichTriggeredAction = getEnvJson<PullRequest>("PR_WHICH_TRIGGERED_ACTION");
const toBranch = "develop"

const octokit = getOctokit();

const baseBranch = prWhichTriggeredAction.base.ref;

if (baseBranch === toBranch) {
  core.notice(`Base branch and target branch are the same and equal ${baseBranch}. Skipping...`);
  process.exit();
}

core.info(`Getting...`);

const {data: closedPullRequests} = await octokit.rest.pulls.list({
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  state: 'closed',
  head: `${github.context.repo.owner}:${baseBranch}`,
  base: toBranch,
  sort: "created",
  direction: "desc",
  per_page: 10,
});

if (closedPullRequests.length === 0) {
  core.notice(`No pull requests found from ${baseBranch} to ${toBranch}  . Skipping...`);
  process.exit()
}

const mergedPullRequests = closedPullRequests.filter(
  (pr) => !!pr.merged_at && pr.number !== prWhichTriggeredAction.number
);

const lastMergedPrToDevelop = mergedPullRequests[0];

if (!lastMergedPrToDevelop) {
  core.notice(`No merged pull requests found from ${baseBranch}} to ${toBranch}. Skipping...`);
  process.exit()
}

core.info(`Title: ${lastMergedPrToDevelop.title}`);
core.info(`URL: ${lastMergedPrToDevelop.html_url}`);
core.info(`Merged at: ${new Date(lastMergedPrToDevelop.merged_at).toLocaleDateString()}`);
core.info(`Merge commit SHA: ${lastMergedPrToDevelop.merge_commit_sha}`);

if (!lastMergedPrToDevelop.merge_commit_sha) {
  exitWithError(`Merge commit SHA is not found for the last merged pull request`);
}

const output = JSON.stringify(lastMergedPrToDevelop);
core.debug(`Output: ${output}`);
core.setOutput("result", output);
