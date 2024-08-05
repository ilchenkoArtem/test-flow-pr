import * as core from '@actions/core';
import * as github from '@actions/github';
import {getOctokit} from './helpers';

const STATUS_CHECK_INTERVAL_MS = 7000;

export const isMergeable = (prNumber: number) => {
  const octokit = getOctokit();

  //We need to check if the PR is mergeable with promise because GitHub API returns null
  //for mergeable field when it is computing the mergeability
  return new Promise<boolean>( (resolve, reject) => {
    const checkMergeable = async () => {
      try {
        const {data: pr} = await octokit.rest.pulls.get({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          pull_number: prNumber,
        });

        if (pr.mergeable === null) {
          core.info(`GitHub has started a background job to compute the mergeability. Recheck after ${STATUS_CHECK_INTERVAL_MS / 1000 } seconds...`);
          setTimeout(checkMergeable, STATUS_CHECK_INTERVAL_MS);
          return;
        }
        resolve(pr.mergeable);
      } catch (error) {
        reject(error);
      }
    }

    checkMergeable();
  })
}
