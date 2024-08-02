import {$} from 'bun';
import * as core from '@actions/core';
import {addGitConfig} from './add-git-config';
import {exitWithError, getEnv} from './helpers';

interface RevertCommitArgs {
  commitToRevert: string;
  branchForRevert: string;
  gitHubToken: string;
}

export const revertCommit = async ({branchForRevert, commitToRevert, gitHubToken}: RevertCommitArgs):Promise<boolean> => {
  //await addGitConfig({gitHubToken});

  const currentBranch = (await $`git branch --show-current`).stdout.toString();
  core.info(`Current branch: ${currentBranch}`);

  const {stderr} = await $`git checkout ${branchForRevert}`;
  console.log('stderr', stderr.toString());

  /*const {stderr, stdout} = await $`git revert ${commitToRevert} --no-edit`.quiet().nothrow();
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

  await $`git push origin ${branchForRevert}`*/

  core.notice(`Commit "${commitToRevert}" has been reverted on branch "${branchForRevert}"`)
  core.info(`Back to the branch "${currentBranch}"`)
  //we need to return to the branch from which the action was triggered to prevent error in next steps
  console.log('currentBranch', currentBranch);
  const {stderr: checkoutError, stdout:checkoutOutput} = await $`git checkout split-flow-v2-2`
  console.log('checkoutError', checkoutError.toString());
  console.log('checkoutOutput', checkoutOutput.toString());
  return true;
}

await revertCommit({
  branchForRevert: 'develop',
  commitToRevert: 'f58c7c3b4b7b9af7f19e591e2c29c705465f9a37-sh',
  gitHubToken: "GITHUB_TOKEN",
})


