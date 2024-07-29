import {$} from 'bun';

interface SquashMergeCommitArgs {
  targetBranch: string;
  sourceBranch: string;
  commitMessage: string;
}

export const squashMergeCommit = async ({targetBranch, sourceBranch, commitMessage}: SquashMergeCommitArgs) => {
  await $`git checkout ${targetBranch}`;
  const result = await $`git merge --squash ${sourceBranch} --no-commit`;
}
