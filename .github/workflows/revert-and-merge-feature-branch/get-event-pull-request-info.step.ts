import * as github from '@actions/github';
import * as core from '@actions/core';
import {exitWithError, getEnv, getOctokit} from "../utils/helpers";

const PR_NUMBER_WHICH_TRIGGERED_ACTION = getEnv("PR_NUMBER");

const octokit = getOctokit();

core.info(`Getting PR info...`);

const {data: triggerPullRequest} = await octokit.rest.pulls.get({
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  pull_number: parseFloat(PR_NUMBER_WHICH_TRIGGERED_ACTION),
});

if (!triggerPullRequest) {
  exitWithError(`PR #${PR_NUMBER_WHICH_TRIGGERED_ACTION} is not found`);
}

core.startGroup(`PR Info:`);
core.info(`Title: ${triggerPullRequest.title}`);
core.info(`URL: ${triggerPullRequest.html_url}`);
core.info(`Merged at: ${new Date(triggerPullRequest.merged_at).toLocaleDateString()}`);
core.endGroup();

const output = triggerPullRequest;

core.debug(`Output: ${output}`);
core.setOutput("result", JSON.stringify(output));


