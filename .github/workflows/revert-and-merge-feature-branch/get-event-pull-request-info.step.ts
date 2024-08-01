import * as github from '@actions/github';
import * as core from '@actions/core';
import {exitWithError, getEnv, getOctokit} from './utils';

const MERGED_PR_NUMBER = getEnv("PR_NUMBER");

const octokit = getOctokit();

core.info(`Getting merged pull request info...`);

const {data: triggerPullRequest} = await octokit.rest.pulls.get({
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  pull_number: parseFloat(MERGED_PR_NUMBER),
});

if (!triggerPullRequest) {
  exitWithError(`Pull request #${MERGED_PR_NUMBER} is not found`);
}

core.startGroup(`PR Info:`);
core.info(`Title: ${triggerPullRequest.title}`);
core.info(`URL: ${triggerPullRequest.html_url}`);
core.info(`Merged at: ${new Date(triggerPullRequest.merged_at).toLocaleDateString()}`);
core.debug(`Full PR info: ${JSON.stringify(triggerPullRequest, null, 2)}`);
core.endGroup();


