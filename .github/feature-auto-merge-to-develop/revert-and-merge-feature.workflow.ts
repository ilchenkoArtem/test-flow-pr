import * as core from '@actions/core';
import * as github from '@actions/github';
import * as process from 'node:process';
import {revertCommit} from './revert-commit';
import {mergeTitle} from './pull-request-title-utils';
import {getIfExistOrCreateNewPR} from './create-new-pr';
import {isMergeable} from './is-mergeable-pr';
import {getEnv} from './utils';
import {exitWithError} from './utils';


const TOKEN = getEnv("GITHUB_TOKEN");
const HEAD_BRANCH = getEnv("HEAD_BRANCH"); //from branch
const BASE_BRANCH = getEnv("BASE_BRANCH"); //to branch
const MERGED_PR_NUMBER = getEnv("PR_NUMBER");

const REQUEST_DATA = {
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
}

const octokit = github.getOctokit(TOKEN);

core.info(`Getting merged pull request info...`);
const {data: triggerPullRequest} = await octokit.rest.pulls.get({
  ...REQUEST_DATA,
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

/* --------------------- Get last merged pull request info --------------------- */
core.startGroup(`Last merged pull request info:`);
core.info(`Fetching pull requests merged into develop from ${BASE_BRANCH}...`);
const {data: closedPullRequestsByHeadBranch} = await octokit.rest.pulls.list({
  ...REQUEST_DATA,
  state: 'closed',
  head: `${REQUEST_DATA.owner}:${BASE_BRANCH}`,
  base: "develop",
  sort: "created",
  direction: "desc",
  per_page: 10,
});

if (closedPullRequestsByHeadBranch.length === 0) {
  core.notice(`No pull requests found for ${HEAD_BRANCH}. Skipping...`);
  process.exit()
}

const mergedPullRequestsByHeadBranch = closedPullRequestsByHeadBranch.filter(
  (pr) => !!pr.merged_at && pr.number !== triggerPullRequest.number
);

if (mergedPullRequestsByHeadBranch.length === 0) {
  core.notice(`No merged pull requests found for ${HEAD_BRANCH}. Skipping...`);
  process.exit()
}

const parentPullRequest = mergedPullRequestsByHeadBranch[0];
const parentPullRequestMergeCommit = parentPullRequest.merge_commit_sha;
const parentPullRequestMergeBaseBranch = parentPullRequest.base.ref;

core.info(`URL: ${parentPullRequest.html_url}`);
core.info(`Title: ${parentPullRequest.title}`);
core.info(`Merged at: ${new Date(parentPullRequest.merged_at).toLocaleDateString()}`);
core.info(`Merge commit SHA: ${parentPullRequestMergeCommit}`);
core.info(`Merged to branch: ${parentPullRequestMergeBaseBranch}`);
core.endGroup()

if (!parentPullRequestMergeCommit) {
  exitWithError(`Merge commit SHA is not found for the last merged pull request`);
}

core.startGroup(`Revert commit "${parentPullRequestMergeCommit}" from "${parentPullRequest.base.ref}"`);
const reverted = await revertCommit({
  branchForRevert: parentPullRequestMergeBaseBranch,
  commitToRevert: parentPullRequestMergeCommit,
  gitHubToken: TOKEN,
});

if (reverted) {
  core.info(`Adding revert comment to the parent PR(${parentPullRequest.html_url})...`);
  await octokit.rest.issues.createComment({
    body: `This PR has been reverted after merge of [${triggerPullRequest.title}](${triggerPullRequest.html_url})`,
    issue_number: parentPullRequest.number,
    ...REQUEST_DATA
  });
}

core.endGroup()

const mergeTitleInfo = mergeTitle(parentPullRequest.title, triggerPullRequest.title);
core.info(`Merge title info: ${JSON.stringify(mergeTitleInfo)}`);

core.startGroup(`Merge to ${parentPullRequest.base.ref}`);
core.info(`Creating new pull request based on the parent pull request "${parentPullRequestMergeBaseBranch}"...`);

const createdPullRequest = await getIfExistOrCreateNewPR({
  githubToken: TOKEN,
  parentPullRequest: {
    headRef: parentPullRequest.head.ref,
    baseRef: parentPullRequest.base.ref,
    title: parentPullRequest.title,
    htmlUrl: parentPullRequest.html_url,
    number: parentPullRequest.number
  },
  title: mergeTitleInfo.merged ? mergeTitleInfo.title : triggerPullRequest.title,
});

if (mergeTitleInfo.merged === true) {
  core.info(`Pull request title is valid. Merging...`);

  const mergeable = await isMergeable({prNumber: createdPullRequest.number, githubToken: TOKEN});

  if (!mergeable) {
    exitWithError(`Pull request is not mergeable. Pls check the PR(${createdPullRequest.html_url}) and merge manually`);
  }

  await octokit.rest.pulls.merge({
    ...REQUEST_DATA,
    pull_number: createdPullRequest.number,
    commit_title: mergeTitleInfo.title + ` (#${triggerPullRequest.number})`,
    merge_method: 'squash',
  });

  core.notice(`PR(${createdPullRequest.html_url}) has been merged`);
} else {
  core.notice(`Can't merge pull requests titles automatically ${mergeTitleInfo.reason}`);
  exitWithError(`Please verify/update the title of the new PR(${createdPullRequest.html_url}) and merge manually`);
}
core.endGroup();

