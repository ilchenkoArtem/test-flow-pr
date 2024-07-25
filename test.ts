import * as core from '@actions/core';
import * as github from '@actions/github';

const TOKEN = process.env.GITHUB_TOKEN;
const HEAD_BRANCH = process.env.HEAD_BRANCH; //from branch
const BASE_BRANCH = process.env.BASE_BRANCH; //to branch

const octokit = github.getOctokit(TOKEN);

console.log('test')

const { data: closedPullRequestsByHeadBranch } = await octokit.rest.pulls.list({
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  state: 'closed',
  head: HEAD_BRANCH,
  sort: 'updated',
  direction: 'desc',
});

console.log('closedPullRequestsByHeadBranch', closedPullRequestsByHeadBranch);

if (closedPullRequestsByHeadBranch.length === 0) {
  core.info(`No pull requests found for ${HEAD_BRANCH}. Skipping...`);
}

const mergedPullRequestsByHeadBranch = closedPullRequestsByHeadBranch.filter(
  (pr) => !!pr.merged_at
);

if (mergedPullRequestsByHeadBranch.length === 0) {
  core.info(`No merged pull requests found for ${HEAD_BRANCH}. Skipping...`);
}

const lastMergedPullRequest = mergedPullRequestsByHeadBranch[0];

