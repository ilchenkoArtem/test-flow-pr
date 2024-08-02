import * as core from '@actions/core';
import * as github from '@actions/github';
import {getIfExistOrCreateNewPR} from './utils/create-new-pr';
import {isMergeable} from './utils/is-mergeable-pr';
import {mergeTitle} from './utils/pull-request-title-utils';
import {exitWithError, getOctokit, getEnvJson} from './utils/helpers';
import {PullRequest} from './types';

const lastMergedPr = getEnvJson<PullRequest>("LAST_MERGED_PR");
const prWhichTriggeredAction = getEnvJson<PullRequest>("PR_WHICH_TRIGGERED_ACTION");
const octokit = getOctokit()

core.info('Merge title of the last merged PR and the PR which triggered the action...');
const mergeTitleInfo = mergeTitle(lastMergedPr.title, prWhichTriggeredAction.title);
core.info(`Merge title info: ${JSON.stringify(mergeTitleInfo)}`);

core.info(`Merge to ${lastMergedPr.base.ref}`);

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
