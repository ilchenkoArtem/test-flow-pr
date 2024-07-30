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

const createNewPullRequestByParent = async ({githubToken, parentPullRequest, title}: CreateNewPrArgs) => {
  const octokit = github.getOctokit(githubToken);

  try {
    const {data: createdPullRequest} = await octokit.rest.pulls.create({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      head: parentPullRequest.headRef,
      base: parentPullRequest.baseRef,
      title: title,
      body: `This PR is created automatically after the revert of PR [${parentPullRequest.title}](${parentPullRequest.htmlUrl}) from ${parentPullRequest.baseRef}.`,
    });

    core.info(`Pull request created: ${createdPullRequest.html_url}`);
    core.info(`Title: ${createdPullRequest.title}`);

    core.startGroup(`Add revert comment to parent PR(${parentPullRequest.htmlUrl})`);
    core.info("Adding comment...");
    await octokit.rest.issues.createComment({
      body: `Created an updated pull request [${createdPullRequest.title}](${parentPullRequest.headRef}})`,
      issue_number: parentPullRequest.number,
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
    });
    core.info("Successfully added")
    core.endGroup();

    return createdPullRequest;
  } catch (error) {
    core.info(error);
    throw error;
  }
}



export const getIfExistOrCreateNewPR = async ({githubToken, title, parentPullRequest}: CreateNewPrArgs) => {
  const octokit = github.getOctokit(githubToken);

  const {data: pullRequests} = await octokit.rest.pulls.list({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    head: parentPullRequest.headRef,
    base: parentPullRequest.baseRef,
    state: 'open',
    per_page: 1,
  });

  const alreadyExistPr = pullRequests[0];

  if (!alreadyExistPr) {
    core.info(`Pull request for ${parentPullRequest.headRef} to ${parentPullRequest.baseRef} does not exist. Creating new pull request`);
    return createNewPullRequestByParent({githubToken, parentPullRequest, title});
  }

  core.startGroup("Pull request already exists:");
  core.info(`Title: ${alreadyExistPr.title}`);
  core.info(`URL: ${alreadyExistPr.html_url}`);
  core.info(`Head: ${alreadyExistPr.head.ref}`);
  core.info(`Base: ${alreadyExistPr.base.ref}`);
  core.endGroup();
  core.info(`Updating the title of the existing pull request...`);
  const {data: updatedPullRequestInfo} = await octokit.rest.pulls.update({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: alreadyExistPr.number,
    title: title,
  })

  return updatedPullRequestInfo;
};
