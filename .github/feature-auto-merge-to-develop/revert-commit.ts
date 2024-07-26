import { $ } from 'bun';
import * as process from 'node:process';
import * as core from '@actions/core';

interface RevertCommitArgs {
  commitToRevert: string;
  branchForRevert: string;
  /**
   * If provided, we will return to this branch after the revert is done.
   * It needed because we are checking out to `branchForRevert` branch before the revert.
   */
  returnToBranch?: string;
}

export const revertCommit = async ({branchForRevert, commitToRevert, returnToBranch}:RevertCommitArgs) => {
  core.info(`Reverting commit "${commitToRevert}" on branch "${branchForRevert}"...`)

  try {
    await $`git checkout ${branchForRevert}`
    await $`git cat-file -t ${commitToRevert}`
    await $`git revert ${commitToRevert} --no-edit`
    await $`git push`


    core.info(`Commit "${commitToRevert}" has been reverted on branch "${branchForRevert}"`)
  } catch (error) {
    core.setFailed(error.message)
    process.exit(1)
  } finally {
    if (returnToBranch) {
      await $`git checkout ${returnToBranch}`
    }
  }
}
