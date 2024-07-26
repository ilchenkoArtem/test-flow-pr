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
    const result = await $`git cat-file -t ${commitToRevert}`
    console.log('result', result);
    await $`git revert ${commitToRevert} --no-edit` // Revert commit without opening the editor
    await $`git push origin ${branchForRevert}`

    if (returnToBranch) {
      await $`git checkout ${returnToBranch}`
    }


    core.info(`Commit "${commitToRevert}" has been reverted on branch "${branchForRevert}"`)
  } catch (error) {
    console.log(`Failed with code ${error.exitCode}`);
    console.log(error.stdout.toString());
    console.log(error.stderr.toString());
    core.setFailed(error.message)
    process.exit(1)
  } finally {
    core.endGroup();
  }
}


