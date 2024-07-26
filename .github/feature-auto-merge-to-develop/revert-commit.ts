import { $ } from 'bun';
import * as process from 'node:process';
import * as core from '@actions/core';
import { processError } from './utils';

interface RevertCommitArgs {
  commitToRevert: string;
  branchForRevert: string;
  gitHubToken: string;
  repoFullName: string;
}

export const revertCommit = async ({branchForRevert, commitToRevert, gitHubToken, repoFullName}:RevertCommitArgs) => {
  core.startGroup(`Reverting commit "${commitToRevert}" on branch "${branchForRevert}"...`)


  try {
    await $`git remote set-url origin https://x-access-token:${gitHubToken}@github.com/${repoFullName}.git`
    await $`git config --global user.email "github-actions[bot]@users.noreply.github.com"`
    await $`git config --global user.name "github-actions[bot]"`

    await $`git checkout ${branchForRevert}`

    const {stderr, stdout} = await $`git revert ${commitToRevert} --no-edit`.quiet().nothrow();
    const revertErrorMessage = stderr.toString();
    const revertResultMessage = stdout.toString();

    if (revertResultMessage.includes("Your branch is up to date")) {
      processError(`Commit "${commitToRevert}" has already been reverted`)
      return;
    }

    if (revertErrorMessage.includes("After resolving the conflicts, mark them with")) {
      core.setFailed(`Failed to revert commit "${commitToRevert}". Please resolve the conflicts manually and run the action again`);
      process.exit(1);
    }

    if (revertErrorMessage.includes("fatal: bad object")) {
      processError(`Failed to revert commit "${commitToRevert}". Commit not found`);
    }

    if (revertErrorMessage) {
      processError(`Failed to revert commit "${commitToRevert}". Error: ${revertErrorMessage}`)
    }

    await $`git push origin ${branchForRevert}`
    core.info(`Commit "${commitToRevert}" has been reverted on branch "${branchForRevert}"`)
  } catch (error) {
    core.setFailed(error.message)
    process.exit(1)
  } finally {
    core.endGroup();
  }
}


