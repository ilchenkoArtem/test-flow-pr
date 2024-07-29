import * as core from '@actions/core';
import * as github from '@actions/github';
import * as process from 'node:process';
import {revertCommit} from './revert-commit';
import {mergeTitle} from './pull-request-title-utils';
import {createNewPullRequestByParent} from './create-new-pr';
import {isMergeable} from './is-mergeable-pr';


const TOKEN = process.env.GITHUB_TOKEN;
const HEAD_BRANCH = process.env.HEAD_BRANCH; //from branch
const BASE_BRANCH = process.env.BASE_BRANCH; //to branch
const MERGED_PR_NUMBER = process.env.PR_NUMBER;

const octokit = github.getOctokit(TOKEN);

core.info(`Getting merged pull request info...`);
const {data: triggerPullRequest} = await octokit.rest.pulls.get({
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  pull_number: parseFloat(MERGED_PR_NUMBER),
});

if (!triggerPullRequest) {
  core.setFailed(`Pull request #${MERGED_PR_NUMBER} is not found`);
  process.exit(1);
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
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  state: 'closed',
  head: BASE_BRANCH,
  base: 'develop',
  sort: 'updated',
  direction: 'desc',
  per_page: 10,
});

if (closedPullRequestsByHeadBranch.length === 0) {
  core.notice(`No pull requests found for ${HEAD_BRANCH}. Skipping...`);
  process.exit()
}

const mergedPullRequestsByHeadBranch = closedPullRequestsByHeadBranch.filter(
  (pr) => !!pr.merged_at && pr.number !== parseFloat(MERGED_PR_NUMBER)
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
  core.setFailed(`Merge commit SHA is not found for the last merged pull request`);
  process.exit(1);
}

core.startGroup(`Revert commit "${parentPullRequestMergeCommit}" from "${parentPullRequest.base.ref}"`);
const reverted = await revertCommit({
  branchForRevert: parentPullRequestMergeBaseBranch,
  commitToRevert: parentPullRequestMergeCommit,
  gitHubToken: TOKEN,
  repoFullName: `${github.context.repo.owner}/${github.context.repo.repo}`,
})

if (reverted) {
  core.info(`Adding revert comment to the parent PR(${parentPullRequest.html_url})...`);
  await octokit.rest.issues.createComment({
    body: `This PR has been reverted after merge of [${parentPullRequest.title}](${parentPullRequest.html_url})`,
    issue_number: parentPullRequest.number,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  });
}

core.endGroup()

const mergeTitleInfo = mergeTitle(parentPullRequest.title, triggerPullRequest.title);
core.info(`Merge title info: ${JSON.stringify(mergeTitleInfo)}`);

core.startGroup(`Merge to ${parentPullRequest.base.ref}`);
core.info(`Creating new pull request based on the parent pull request "${parentPullRequestMergeBaseBranch}"...`);
const createdPullRequest = await createNewPullRequestByParent({
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
    core.setFailed(`Pull request is not mergeable`);
    process.exit(1);
  }

  await octokit.rest.pulls.merge({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: createdPullRequest.number,
    commit_title: mergeTitleInfo.title,
    merge_method: 'squash',
  });

  core.notice(`PR(${createdPullRequest.html_url}) has been merged`);
} else {
  core.notice(`Can't merge pull requests titles automatically ${mergeTitleInfo.reason}`);
  core.setFailed(`Please verify/update the title of the new PR(${createdPullRequest.html_url}) and merge manually`);
  process.exit(1)
}
core.endGroup();

