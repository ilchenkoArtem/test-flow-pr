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

  const test = await $`git status`.text();
  console.log('test', test);
  const currentBranch = await $`git rev-parse --abbrev-ref HEAD | grep -v ^HEAD$ || git rev-parse HEAD`.text();
  core.info(`Current branch: ${currentBranch}`)

  if (!currentBranch) {
    exitWithError("Current branch cannot be empty");
  }

  await $`git checkout ${branchForRevert}`;

  const {stderr, stdout} = await $`git revert ${commitToRevert} --no-edit`.quiet().throws(false);
  const revertErrorMessage = stderr.toString();
  const revertResultMessage = stdout.toString();

  console.log('revertErrorMessage', revertErrorMessage);
  console.log('revertResultMessage', revertResultMessage);

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
  core.info(`Back to the branch "${currentBranch}"`)
  //we need to return to the branch from which the action was triggered to prevent error in next steps
  await $`git checkout ${currentBranch}`
  return true;
}


