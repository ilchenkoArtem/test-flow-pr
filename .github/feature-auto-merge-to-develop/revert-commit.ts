import { $ } from 'bun';
import * as process from 'node:process';
import * as core from '@actions/core';

interface RevertCommitArgs {
  commitToRevert: string;
  branchForRevert: string;
  gitHubToken: string;
  repoFullName: string;
  /**
   * If provided, we will return to this branch after the revert is done.
   * It needed because we are checking out to `branchForRevert` branch before the revert.
   */
  returnToBranch?: string;
}

export const revertCommit = async ({branchForRevert, commitToRevert, returnToBranch, gitHubToken, repoFullName}:RevertCommitArgs) => {
  core.startGroup(`Reverting commit "${commitToRevert}" on branch "${branchForRevert}"...`)


  try {
    await $`git remote set-url origin https://x-access-token:${gitHubToken}@github.com/${repoFullName}.git`
    await $`git config --global user.email "artem.ilchenko@711media.de"`
    await $`git config --global user.name "ilchenkoArtem"`

    await $`git checkout ${branchForRevert}`
    //await $`git cat-file -t ${commitToRevert}`;
    await revert(commitToRevert);
    await $`git push origin ${branchForRevert}`

    core.info(`Commit "${commitToRevert}" has been reverted on branch "${branchForRevert}"`)
  } catch (error) {
    core.setFailed(error.message)
    process.exit(1)
  } finally {
    core.endGroup();
  }
}


const revert = async (commit: string) => {
  const {stderr, stdout} = await $`git revert ${commit} --no-edit`.quiet().nothrow();
  const errorMessage = stderr.toString();
  const resultMessage = stdout.toString();

  if (resultMessage.includes("Your branch is up to date")) {
    core.notice(`Commit "${commit}" has already been reverted`)
    return;
  }

  console.log('errorMessage', errorMessage);
  console.log('resultMessage', resultMessage);
  return;
}


