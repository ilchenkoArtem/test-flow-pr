import * as github from '@actions/github';
import {GitHub} from '@actions/github/lib/utils';
import * as core from '@actions/core';

interface CreatePullRequestArgs {
  headBranch: string;
  baseBranch: string;
  octokit: InstanceType<typeof GitHub>;
  title: string;
  basedOnPrNumber?: number;
}

export const createPullRequest = async ({octokit, baseBranch, headBranch, title}:CreatePullRequestArgs) => {
  const {data: createdPullRequest} = await octokit.rest.pulls.create({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    head: baseBranch,
    base: headBranch,
    title: title,
    body: `This PR is created automatically by the action to merge "${baseBranch}" into "${headBranch}"`,
  });

  return createdPullRequest
}
