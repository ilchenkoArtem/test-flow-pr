import * as github from '@actions/github';
import * as core from '@actions/core';



interface CreateNewPrArgs {
  githubToken: string;
  title: string;
  parentPullRequest: {
    headRef: string;
    baseRef: string;
    title: string;
    htmlUrl: string;
    number: number;
  }
}

export const createNewPullRequestByParent = async ({githubToken, parentPullRequest}: CreateNewPrArgs) => {
  const octokit = github.getOctokit(githubToken);

  const {data: createdPullRequest} = await octokit.rest.pulls.create({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    head: parentPullRequest.headRef,
    base: parentPullRequest.baseRef,
    title: parentPullRequest.title,
    body: `This PR is created automatically after the revert of PR [${parentPullRequest.title}](${parentPullRequest.htmlUrl}) from ${parentPullRequest.baseRef}.`,
  });


  core.startGroup(`Add revert comment to parent PR(${parentPullRequest.htmlUrl})`);
  core.info("Adding comment...");
  await octokit.rest.issues.createComment({
    body: `This PR has been reverted after merge of [${createdPullRequest.title}](${parentPullRequest.headRef}})`,
    issue_number: parentPullRequest.number,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  });
  core.info("Successfully added")
  core.endGroup();

  return createdPullRequest;
}
