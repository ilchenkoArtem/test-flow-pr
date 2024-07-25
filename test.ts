import * as core from '@actions/core';
import * as github from '@actions/github';

const TOKEN = process.env.GITHUB_TOKEN;
const HEAD_BRANCH = process.env.HEAD_BRANCH; //from branch
const BASE_BRANCH = process.env.BASE_BRANCH; //to branch

const octokit = github.getOctokit(TOKEN);


core.info(`Fetching pull requests merged into develop from ${BASE_BRANCH}...`);
const { data: closedPullRequestsByHeadBranch } = await octokit.rest.pulls.list({
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
}

const mergedPullRequestsByHeadBranch = closedPullRequestsByHeadBranch.filter(
  (pr) => !!pr.merged_at
);

if (mergedPullRequestsByHeadBranch.length === 0) {
  core.notice(`No merged pull requests found for ${HEAD_BRANCH}. Skipping...`);
}

const lastMergedPullRequest = mergedPullRequestsByHeadBranch[0];

core.startGroup(`Last merged pull request:`);
core.info(`  URL: ${lastMergedPullRequest.html_url}`);
core.info(`  Title: ${lastMergedPullRequest.title}`);
core.info(`  Merged at: ${new Date(lastMergedPullRequest.merged_at).toLocaleDateString()}`);
core.endGroup()

