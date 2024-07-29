import * as core from '@actions/core';
import * as github from '@actions/github';
import * as process from 'node:process';
import {revertCommit} from './revert-commit';
import {mergeTitle} from './utils';


const TOKEN = process.env.GITHUB_TOKEN;
const HEAD_BRANCH = process.env.HEAD_BRANCH; //from branch
const BASE_BRANCH = process.env.BASE_BRANCH; //to branch
const MERGED_PR_NUMBER = process.env.PR_NUMBER;

const octokit = github.getOctokit(TOKEN);

/* --------------------- Get last merged pull request info --------------------- */
core.startGroup(`Last merged pull request info:`);
core.info(`Fetching pull requests merged into develop from ${BASE_BRANCH}...`);
const {data: closedPullRequestsByHeadBranch} = await octokit.rest.pulls.list({
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  state: 'closed',
  head: HEAD_BRANCH,
  base: "develop",
  sort: 'updated',
  direction: 'desc',
});

if (closedPullRequestsByHeadBranch.length === 0) {
  core.notice(`No pull requests found for ${HEAD_BRANCH}. Skipping...`);
  process.exit()
}

const mergedPullRequestsByHeadBranch = closedPullRequestsByHeadBranch.filter(
  (pr) => !!pr.merged_at
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

core.startGroup(`Reverting commit "${parentPullRequestMergeCommit}"...`);
await revertCommit({
  branchForRevert: parentPullRequestMergeBaseBranch,
  commitToRevert: parentPullRequestMergeCommit,
  gitHubToken: TOKEN,
  repoFullName: `${github.context.repo.owner}/${github.context.repo.repo}`,
})
core.endGroup()

core.info(`Getting new pull request #${MERGED_PR_NUMBER} info...`);
const {data: mergedPullRequest} = await octokit.rest.pulls.get({
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  pull_number: parseFloat(MERGED_PR_NUMBER),
});

if (!mergedPullRequest) {
  core.setFailed(`Pull request #${MERGED_PR_NUMBER} is not found`);
  process.exit(1);
}

core.startGroup(`PR #${MERGED_PR_NUMBER} info:`);
core.info(`URL: ${mergedPullRequest.html_url}`);
core.info(`Title: ${mergedPullRequest.title}`);
core.info(`Merged at: ${new Date(mergedPullRequest.merged_at).toLocaleDateString()}`);
core.endGroup();

core.startGroup(`Create pull request based on the last merged pull request "${parentPullRequestMergeBaseBranch}"...`);
const title = mergeTitle(mergedPullRequest.title, parentPullRequestMergeBaseBranch);

const {data: newPullRequest} = await octokit.rest.pulls.create({
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  input: `Merge ${parentPullRequestMergeBaseBranch} into develop`,
  head: parentPullRequestMergeBaseBranch,
  base: "develop",
  body: `This PR is created automatically by the action to merge "${parentPullRequestMergeBaseBranch}" into "develop"`,
});

core.info("Pull request has been created");
core.info(`Title: ${newPullRequest.title}`);
core.info(`URL: ${newPullRequest.html_url}`);
core.endGroup();






