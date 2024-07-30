import * as core from '@actions/core';
import {exitWithError, getEnv} from './utils';
import {isValidPullRequestTitle} from './pull-request-title-utils';

const PR_TITLE = getEnv("PR_TITLE");
const isValid = isValidPullRequestTitle(PR_TITLE);

if (isValid) {
  core.notice(`Pull request title "${PR_TITLE}" is valid.`);
} else {
  exitWithError(`Pull request title "${PR_TITLE}" is invalid."`);
}

