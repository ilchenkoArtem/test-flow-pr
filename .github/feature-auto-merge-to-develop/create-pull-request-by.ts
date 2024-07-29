import * as github from '@actions/github';
import {GitHub} from '@actions/github/lib/utils';
import type {
  RestEndpointMethodTypes
} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

interface CreatePullRequestArgs {
  octokit: InstanceType<typeof GitHub>;
  title: string;
  byPullRequest: RestEndpointMethodTypes["pulls"]["get"]["response"]['data'];
}

export const createPullRequestBy = async ({octokit, byPullRequest, title}:CreatePullRequestArgs) => {
  const {data: createdPullRequest} = await octokit.rest.pulls.create({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    head: byPullRequest.head.ref,
    base: byPullRequest.base.ref,
    body: `This PR is created automatically after the revert of PR [${byPullRequest.title}](${byPullRequest.url}) from ${byPullRequest.base.ref}.`,
  });

  return createdPullRequest
}
