import * as core from '@actions/core';
import * as github from '@actions/github';
import {getIfExistOrCreateNewPR} from './utils/create-new-pr';
import {isMergeable} from './utils/is-mergeable-pr';
import {mergeTitle} from './utils/pull-request-title-utils';
import {exitWithError, getOctokit, getEnvJson} from './utils/helpers';
import {PullRequest} from './types';

const revertedPr = getEnvJson<PullRequest>("REVERTED_PR");
const prWhichTriggeredAction = getEnvJson<PullRequest>("PR_WHICH_TRIGGERED_ACTION");
const octokit = getOctokit()

core.info('Merge title of the last merged PR and the PR which triggered the action...');
const mergeTitleInfo = mergeTitle(revertedPr.title, prWhichTriggeredAction.title);
core.info(`Merge title info: ${JSON.stringify(mergeTitleInfo)}`);

core.info(`Merge to ${revertedPr.base.ref}`);

core.info(`Creating new pull request based on the parent pull request...`);
const createdPullRequest = await getIfExistOrCreateNewPR({
  parentPullRequest: {
    headRef: revertedPr.head.ref,
    baseRef: revertedPr.base.ref,
    title: revertedPr.title,
    htmlUrl: revertedPr.html_url,
    number: revertedPr.number
  },
  title: mergeTitleInfo.merged ? mergeTitleInfo.title : prWhichTriggeredAction.title,
});


if (mergeTitleInfo.merged === true) {
  core.info(`Pull request title is valid. Merging...`);

  const mergeable = await isMergeable(createdPullRequest.number);

  if (!mergeable) {
    exitWithError(`Pull request is not mergeable. Pls check the PR(${createdPullRequest.html_url}) and merge manually`);
  }

  await octokit.rest.pulls.merge({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
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
