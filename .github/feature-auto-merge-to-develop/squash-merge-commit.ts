import {$} from 'bun';
import {addGitConfig} from './add-git-config';
import * as core from '@actions/core';

interface MergeResult {
  merged: boolean;
  error?: string;
}

interface SquashMergeCommitArgs {
  targetBranch: string;
  sourceBranch: string;
  commitMessage: string;
  gitHubToken: string;
}

const failMergeResult = (error: string): MergeResult => {
  return {merged: false, error};
}

const successMergeResult = (): MergeResult => {
  return {merged: true};
}

export const squashMergeCommit = async ({targetBranch, sourceBranch, commitMessage, gitHubToken}: SquashMergeCommitArgs) => {
  await addGitConfig({gitHubToken});

  core.info(`Squash merging commit from ${sourceBranch} to ${targetBranch}...`);
  await $`git checkout ${targetBranch}`;
  const { stderr, exitCode} = await $`git merge --squash origin/${sourceBranch}`.nothrow()

  if (stderr.toString().includes("Automatic merge went well")) {
    core.info(`Committing changes...`);
    await $`git commit -m "${commitMessage}"`;
    return successMergeResult();
  }

  core.error(`Failed to merge commit from ${sourceBranch} to ${targetBranch}`);
  return failMergeResult(stderr.toString());
}
