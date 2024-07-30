import * as core from '@actions/core';
import {exitWithError, getEnv} from './utils';
import {createPrTitle, isValidPullRequestTitle} from './pull-request-title-utils';

const PR_TITLE = getEnv("PR_TITLE");
const isValid = isValidPullRequestTitle(PR_TITLE);

if (isValid) {
  core.notice(`Pull request title "${PR_TITLE}" is valid.`);
} else {
  core.info("Template for PR title with tasks: <type>(<task numbers>): <description>");
  core.info("Template for PR title without tasks: <type>: <description>");
  core.info(`Example: ${createPrTitle('feat', ['FL-1234', 'FL-1235'], 'Add new feature')}`);
  exitWithError(`Pull request title "${PR_TITLE}" is invalid."`);
}

