import {revertCommit} from '../';
import {getEnv} from './utils';
import type {
  RestEndpointMethodTypes
} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

const prWhichTriggeredAction = getEnv<RestEndpointMethodTypes["pulls"]["get"]["response"]['data']>("PR_WHICH_TRIGGERED_ACTION");


const reverted = await revertCommit({
  branchForRevert: parentPullRequestMergeBaseBranch,
  commitToRevert: parentPullRequestMergeCommit,
  gitHubToken: TOKEN,
});
