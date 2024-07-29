import {$} from 'bun';
import * as core from '@actions/core';

interface RevertCommitArgs {
  commitToRevert: string;
  branchForRevert: string;
  gitHubToken: string;
  repoFullName: string;
}

export const revertCommit = async ({branchForRevert, commitToRevert, gitHubToken, repoFullName}: RevertCommitArgs) => {
  await $`git remote set-url origin https://x-access-token:${gitHubToken}@github.com/${repoFullName}.git`
  await $`git config --global user.email "github-actions[bot]@users.noreply.github.com"`
  await $`git config --global user.name "github-actions[bot]"`

  await $`git checkout ${branchForRevert}`

  const {stderr, stdout} = await $`git revert ${commitToRevert} --no-edit`.quiet().nothrow();
  const revertErrorMessage = stderr.toString();
  const revertResultMessage = stdout.toString();

  if (revertResultMessage.includes("Your branch is up to date")) {
    core.notice(`Commit "${commitToRevert}" has already been reverted`)
    return;
  }

  if (revertErrorMessage.includes("After resolving the conflicts, mark them with")) {
    core.setFailed(`Failed to revert commit "${commitToRevert}". Please resolve the conflicts and revert commit manually after that run the action again`);
    process.exit(1);
  }

  if (revertErrorMessage.includes("fatal: bad object")) {
    core.setFailed(`Failed to revert commit "${commitToRevert}". Commit not found`);
    process.exit(1);
  }

  if (revertErrorMessage) {
    core.setFailed(`Failed to revert commit "${commitToRevert}". Error: ${revertErrorMessage}`)
    process.exit(1);
  }

  await $`git push origin ${branchForRevert}`

  core.notice(`Commit "${commitToRevert}" has been reverted on branch "${branchForRevert}"`)
}


