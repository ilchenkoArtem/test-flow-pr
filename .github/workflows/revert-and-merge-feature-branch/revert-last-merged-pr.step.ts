import {revertCommit} from './revert-commit';
import {getEnv} from './utils';
import {PullRequest} from './types';
import * as core from '@actions/core';

const lastMergedPr = getEnv<PullRequest>("LAST_MERGED_PR_TO_BASE_BRANCH");

core.info(`Revert commit "${lastMergedPr.merge_commit_sha}" from "${lastMergedPr.base.ref}"`);
const reverted = await revertCommit({
  branchForRevert: lastMergedPr.base.ref,
  commitToRevert: lastMergedPr.merge_commit_sha,
  gitHubToken: getEnv("GITHUB_TOKEN"),
});

const output = JSON.stringify(reverted);
core.debug(`Is Reverted: ${output}`);
core.setOutput("result", output);


