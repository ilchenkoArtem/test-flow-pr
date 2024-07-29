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
  const {stdout, stderr} = await $`git merge --squash ${sourceBranch}`.nothrow();

  if (stderr) {
    await $`git merge --abort`;
    return failMergeResult(stderr.toString());
  }

  await $`git commit -m "${commitMessage}"`;
  await $`git push origin ${targetBranch}`;

}
