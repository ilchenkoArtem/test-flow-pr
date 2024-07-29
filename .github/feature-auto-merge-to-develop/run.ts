import * as core from '@actions/core';
import * as github from '@actions/github';
import * as process from 'node:process';
import {revertCommit} from './revert-commit';
import {mergeTitle} from './pull-request-title-utils';


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
  head: HEAD_BRANCH,
  baseTitle: "develop",
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

core.startGroup(`Creating new pull request based on the parent pull request "${parentPullRequestMergeBaseBranch}"...`);
const mergeTitleInfo = mergeTitle(parentPullRequest.title, triggerPullRequest.title);

try {
  const {data: createdPullRequest} = await octokit.rest.pulls.create({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    head: parentPullRequest.head.ref,
    base: parentPullRequest.base.ref,
    title: mergeTitleInfo.merged ? mergeTitleInfo.title : parentPullRequest.title,
    body: `This PR is created automatically after the revert of PR [${parentPullRequest.title}](${parentPullRequest.url}) from ${parentPullRequest.base.ref}.`,
  });
} catch (e) {
  core.setFailed(e.message);
  process.exit(1);
}


if (mergeTitleInfo.merged === true) {
  core.info("PR created successfully:");
  core.info(`Title: ${mergeTitleInfo.title}`);
  core.info(`URL: ${createdPullRequest.html_url}`);
} else {
  core.error(`Can't merge pull requests titles automatically ${mergeTitleInfo.reason}`);
  core.setFailed(`Please verify/update the title of the new PR(${createdPullRequest.html_url}) and merge manually`);
}
core.endGroup();


core.startGroup(`Add revert comment to parent PR #${parentPullRequest.number}...`);
await octokit.rest.issues.createComment({
  body: `This PR has been reverted by PR #${MERGED_PR_NUMBER}.`,
  issue_number: parentPullRequest.number,
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
});
core.endGroup();






