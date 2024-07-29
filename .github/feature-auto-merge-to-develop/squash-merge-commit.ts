import {$} from 'bun';
import {addGitConfig} from './add-git-config';

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

export const squashMergeCommit = async ({targetBranch, sourceBranch, commitMessage, gitHubToken}: SquashMergeCommitArgs) => {
  await addGitConfig({gitHubToken});

  await $`git checkout ${targetBranch}`;
  const { stderr, exitCode} = await $`git merge --squash origin/${sourceBranch}`.nothrow();

  console.log('stderr', stderr.toString());

  if (stderr) {
    await $`git merge --abort`.nothrow().quiet();
    return failMergeResult(stderr.toString());
  }

  await $`git commit -m "${commitMessage}"`;
  await $`git push origin ${targetBranch}`;

  return {merged: true};
}
