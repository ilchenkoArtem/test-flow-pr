import * as core from '@actions/core';
import * as github from '@actions/github';

interface IsMergeablePrArgs {
  prNumber: number;
  githubToken: string;
}

export const isMergeable = ({prNumber, githubToken}: IsMergeablePrArgs) => {
  const octokit = github.getOctokit(githubToken);

  return new Promise<boolean>(async (resolve, reject) => {
    try {
      const {data: pr} = await octokit.rest.pulls.get({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: prNumber,
      });

      if (pr.mergeable === null) {
        core.info(`GitHub has started a background job to compute the mergeability. Waiting...`);
        return new Promise((resolve) => setTimeout(resolve, 7000));
      }
    } catch (error) {
      reject(error);
    }


    resolve(pr.mergeable);
  })
}
