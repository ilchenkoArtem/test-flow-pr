import {revertCommit} from './utils/revert-commit';
import {getEnv, getEnvJson} from './utils/helpers';
import {PullRequest} from './types';
import * as core from '@actions/core';

const lastMergedPr = getEnvJson<PullRequest>("LAST_MERGED_PR");

console.log('typeof lastMergedPr', typeof lastMergedPr);
core.debug(`Input Last Merged PR: ${JSON.stringify(lastMergedPr)}`);

core.info(`Revert commit "${lastMergedPr.merge_commit_sha}" from "${lastMergedPr.base.ref}"`);
const reverted = await revertCommit({
  branchForRevert: lastMergedPr.base.ref,
  commitToRevert: lastMergedPr.merge_commit_sha,
  gitHubToken: getEnv("GITHUB_TOKEN"),
});

const output = JSON.stringify(reverted);
core.debug(`Is Reverted: ${output}`);
core.setOutput("result", output);


