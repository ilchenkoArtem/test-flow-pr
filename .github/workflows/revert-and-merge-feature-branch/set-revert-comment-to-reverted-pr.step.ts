import * as core from '@actions/core';
import * as github from '@actions/github';
import { getEnvJson, getOctokit} from './utils/helpers';
import {PullRequest} from './types';

const revertedPullRequest = getEnvJson<PullRequest>("REVERTED_PR");
const actionTriggeredPullRequest = getEnvJson<PullRequest>("PR_WHICH_TRIGGERED_ACTION");

const octokit = getOctokit();

core.info(`Adding revert comment to the parent PR(${actionTriggeredPullRequest.html_url})...`);
await octokit.rest.issues.createComment({
  body: `This PR has been reverted after merge of [${actionTriggeredPullRequest.title}](${actionTriggeredPullRequest.html_url})`,
  issue_number: revertedPullRequest.number,
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
});
