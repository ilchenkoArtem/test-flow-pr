import * as core from '@actions/core';
import * as github from '@actions/github';

const TOKEN = process.env.GITHUB_TOKEN;
const FROM_BRANCH = process.env.FROM_BRANCH;
const TO_BRANCH = process.env.TO_BRANCH;

console.log('FROM_BRANCH', FROM_BRANCH);
console.log('TO_BRANCH', TO_BRANCH);

const octokit = github.getOctokit(TOKEN);


const { data: pulls } = await octokit.rest.pulls.list({
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  state: 'closed',
  base: TO_BRANCH,
  sort: 'updated',
  direction: 'desc',
});
