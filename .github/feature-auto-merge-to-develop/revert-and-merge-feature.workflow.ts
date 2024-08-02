import * as core from '@actions/core';
import {revertCommit} from './revert-commit';
import {mergeTitle} from './pull-request-title-utils';
import {getIfExistOrCreateNewPR} from './create-new-pr';
import {isMergeable} from './is-mergeable-pr';
import {BASE_REQUEST_DATA, getEnv, getOctokit} from './utils';
import {exitWithError} from './utils';
import {getPrWhichTriggeredActionStep} from "./get-pr-which-triggered-action.step";
import {getLastMergedPrStep} from "./get-last-merged-pr.step"

const GITHUB_TOKEN =  getEnv("GITHUB_TOKEN");

const octokit = getOctokit()

const prWhichTriggeredAction = await getPrWhichTriggeredActionStep();
const lastMergedPr = await getLastMergedPrStep(prWhichTriggeredAction);


core.startGroup(`Revert commit "${lastMergedPr.merge_commit_sha}" from "${lastMergedPr.base.ref}"`);
const reverted = await revertCommit({
  branchForRevert: lastMergedPr.base.ref,
  commitToRevert: lastMergedPr.merge_commit_sha,
  gitHubToken: GITHUB_TOKEN,
});

if (reverted) {
  core.info(`Adding revert comment to the parent PR(${prWhichTriggeredAction.html_url})...`);
  await octokit.rest.issues.createComment({
    body: `This PR has been reverted after merge of [${prWhichTriggeredAction.title}](${prWhichTriggeredAction.html_url})`,
    issue_number: lastMergedPr.number,
    ...BASE_REQUEST_DATA
  });
}

core.endGroup()

const mergeTitleInfo = mergeTitle(lastMergedPr.title, prWhichTriggeredAction.title);
core.info(`Merge title info: ${JSON.stringify(mergeTitleInfo)}`);

core.startGroup(`Merge to ${lastMergedPr.base.ref}`);
core.info(`Creating new pull request based on the parent pull request...`);
const createdPullRequest = await getIfExistOrCreateNewPR({
  parentPullRequest: {
    headRef: lastMergedPr.head.ref,
    baseRef: lastMergedPr.base.ref,
    title: lastMergedPr.title,
    htmlUrl: lastMergedPr.html_url,
    number: lastMergedPr.number
  },
  title: mergeTitleInfo.merged ? mergeTitleInfo.title : prWhichTriggeredAction.title,
});

if (mergeTitleInfo.merged === true) {
  core.info(`Pull request title is valid. Merging...`);

  const mergeable = await isMergeable({prNumber: createdPullRequest.number, githubToken: TOKEN});

  if (!mergeable) {
    exitWithError(`Pull request is not mergeable. Pls check the PR(${createdPullRequest.html_url}) and merge manually`);
  }

  await octokit.rest.pulls.merge({
    ...BASE_REQUEST_DATA,
    pull_number: createdPullRequest.number,
    commit_title: mergeTitleInfo.title + ` (#${createdPullRequest.number})`,
    merge_method: 'squash',
  });

  core.notice(`PR(${createdPullRequest.html_url}) has been merged`);
} else {
  core.notice(`Can't merge pull requests titles automatically ${mergeTitleInfo.reason}`);
  exitWithError(`Please verify/update the title of the new PR(${createdPullRequest.html_url}) and merge manually`);
}
core.endGroup();

