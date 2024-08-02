import * as github from '@actions/github';
import * as core from '@actions/core';
import {getOctokit} from './helpers';

const REQUEST_DATA = {
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
}


interface CreateNewPrArgs {
  title: string;
  parentPullRequest: {
    headRef: string;
    baseRef: string;
    title: string;
    htmlUrl: string;
    number: number;
  }
}

const createNewPullRequestByParent = async ({parentPullRequest, title}: CreateNewPrArgs) => {
  const octokit = getOctokit();

  try {
    const {data: createdPullRequest} = await octokit.rest.pulls.create({
      ...REQUEST_DATA,
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
      ...REQUEST_DATA
    });
    core.info("Successfully added")
    core.endGroup();

    return createdPullRequest;
  } catch (error) {
    core.info(error);
    throw error;
  }
}


export const getIfExistOrCreateNewPR = async ({title, parentPullRequest}: CreateNewPrArgs) => {
  const octokit = getOctokit();

  const {data: pullRequests} = await octokit.rest.pulls.list({
    ...REQUEST_DATA,
    head: `${REQUEST_DATA.owner}:${parentPullRequest.headRef}`,
    base: parentPullRequest.baseRef,
    state: 'open',
    sort: "created",
    direction: "desc",
    per_page: 1,
  });

  const alreadyExistPr = pullRequests[0];

  if (!alreadyExistPr) {
    core.info(`Pull request for ${parentPullRequest.headRef} to ${parentPullRequest.baseRef} does not exist. Creating new pull request`);
    return createNewPullRequestByParent({parentPullRequest, title});
  }

  core.warning(`Pull request already exists from ${parentPullRequest.headRef} to ${parentPullRequest.baseRef} branches`);

  core.startGroup("Pull request already exists:");
  core.info(`Title: ${alreadyExistPr.title}`);
  core.info(`URL: ${alreadyExistPr.html_url}`);
  core.info(`Head: ${alreadyExistPr.head.ref}`);
  core.info(`Base: ${alreadyExistPr.base.ref}`);
  core.endGroup();
  core.info(`Updating the title of the existing pull request...`);
  const {data: updatedPullRequestInfo} = await octokit.rest.pulls.update({
    ...REQUEST_DATA,
    pull_number: alreadyExistPr.number,
    title: title,
  })

  return updatedPullRequestInfo;
};
