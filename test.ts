import * as core from '@actions/core';
import * as github from '@actions/github';
import * as process from 'node:process';
import { $ } from "bun";


const TOKEN = process.env.GITHUB_TOKEN;
const HEAD_BRANCH = process.env.HEAD_BRANCH; //from branch
const BASE_BRANCH = process.env.BASE_BRANCH; //to branch

const octokit = github.getOctokit(TOKEN);

/* --------------------- Get last merged pull request info --------------------- */
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

const lastMergedPullRequest = mergedPullRequestsByHeadBranch[0];
const lastPullRequestMergeCommit = lastMergedPullRequest.merge_commit_sha;

core.startGroup(`Last merged pull request info:`);
core.info(`URL: ${lastMergedPullRequest.html_url}`);
core.info(`Title: ${lastMergedPullRequest.title}`);
core.info(`Merged at: ${new Date(lastMergedPullRequest.merged_at).toLocaleDateString()}`);
core.info(`Merge commit SHA: ${lastPullRequestMergeCommit}`);
core.endGroup()

if (!lastPullRequestMergeCommit) {
  core.setFailed(`Merge commit SHA is not found for the last merged pull request`);
  process.exit(1);
}

await $`git remote get-url origin`;



