import {$} from 'bun';
import * as core from '@actions/core';
import {addGitConfig} from './add-git-config';
import {exitWithError} from './helpers';

interface RevertCommitArgs {
  commitToRevert: string;
  branchForRevert: string;
  gitHubToken: string;
}

export const revertCommit = async ({branchForRevert, commitToRevert, gitHubToken}: RevertCommitArgs):Promise<boolean> => {
  await addGitConfig({gitHubToken});
  await $`git checkout ${branchForRevert}`

  const {stderr, stdout} = await $`git revert ${commitToRevert} --no-edit`.quiet().nothrow();
  const revertErrorMessage = stderr.toString();
  const revertResultMessage = stdout.toString();

  if (revertResultMessage.includes("Your branch is up to date")) {
    core.notice(`Commit "${commitToRevert}" has already been reverted`)
    return false;
  }

  if (revertErrorMessage.includes("After resolving the conflicts, mark them with")) {
    exitWithError(`Failed to revert commit "${commitToRevert}". Please resolve the conflicts and revert commit manually after that run the action again`);
  }

  if (revertErrorMessage.includes("fatal: bad object")) {
    exitWithError(`Failed to revert commit "${commitToRevert}". Commit not found`);
  }

  if (revertErrorMessage) {
    exitWithError(`Failed to revert commit "${commitToRevert}". Error: ${revertErrorMessage}`);
  }

  await $`git push origin ${branchForRevert}`

  core.notice(`Commit "${commitToRevert}" has been reverted on branch "${branchForRevert}"`)
  return true;
}


