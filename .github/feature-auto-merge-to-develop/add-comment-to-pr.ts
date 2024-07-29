import {GitHub} from '@actions/github/lib/utils';
import * as github from '@actions/github';
import * as core from '@actions/core';

interface AddCommentToPrArgs {
  prNumber: number;
  body: string;
  octokit: InstanceType<typeof GitHub>;
}

export const addCommentToPr = async ({body, prNumber, octokit}: AddCommentToPrArgs) => {
  core.info(`Adding comment to PR #${prNumber}...`);
  const {data} = await octokit.rest.issues.createComment({
    body,
    issue_number: prNumber,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  });
  core.notice(`Comment has been added to PR #${prNumber}`);
  return data
}
