import {$} from 'bun';
import * as core from '@actions/core';
import {addGitConfig} from './add-git-config';
import {exitWithError} from './helpers';

$.throws(true)

interface RevertCommitArgs {
  commitToRevert: string;
  branchForRevert: string;
  gitHubToken: string;
}

export const revertCommit = async ({branchForRevert, commitToRevert, gitHubToken}: RevertCommitArgs):Promise<boolean> => {
  await addGitConfig({gitHubToken});

  const tempBranchName = `temp-branch-${new Date().getTime()}`;
  await $`git checkout -b ${tempBranchName}`;
  core.notice(`Created a temporary branch "${tempBranchName}"`)

  await $`git checkout ${branchForRevert}`;

  const {stderr, stdout} = await $`git revert ${commitToRevert} --no-edit`.quiet().throws(false);
  const revertErrorMessage = stderr.toString();
  const revertResultMessage = stdout.toString();

  if (revertResultMessage.includes("Your branch is up to date")) {
    core.notice(`Commit "${commitToRevert}" has already been reverted`)
    await $`git checkout ${tempBranchName}`
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

  await $`git push origin ${branchForRevert}`.throws(true);


  core.notice(`Commit "${commitToRevert}" has been reverted on branch "${branchForRevert}"`)
  //we need to return to the branch from which the action was triggered to prevent error in next steps
  await $`git checkout ${tempBranchName}`
  return true;
}


