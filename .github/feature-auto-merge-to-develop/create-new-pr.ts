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
  const TOKEN = github.getOctokit(githubToken);

  const {data: pullRequests} = await TOKEN.rest.pulls.list({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    head: parentPullRequest.headRef,
    base: parentPullRequest.baseRef,
    state: 'open',
    per_page: 1,
  });

  if (pullRequests.length === 0) {
    return createNewPullRequestByParent({githubToken, parentPullRequest, title});
  }

  const pr = pullRequests[0];
  core.notice(`Pull request for ${parentPullRequest.headRef} to ${parentPullRequest.baseRef} already exists. PR: ${pr.html_url}` );
  return pr;
};
