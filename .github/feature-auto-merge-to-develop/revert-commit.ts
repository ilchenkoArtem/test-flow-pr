import { $ } from 'bun';
import * as process from 'node:process';
import * as core from '@actions/core';
import * as github from '@actions/github';

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
    await $`git config --global user.email "github-actions[bot]@users.noreply.github.com"`
    await $`git config --global user.name "github-actions[bot]"`

    await $`git checkout ${branchForRevert}`
    await $`git cat-file -t ${commitToRevert}` // Check if commit exists
    await $`git revert ${commitToRevert} --no-edit` // Revert commit without opening the editor
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

export const revertCommit2 = async ({branchForRevert, commitToRevert}: RevertCommitArgs) => {
  const TOKEN = process.env.GITHUB_TOKEN;
  const octokit = github.getOctokit(TOKEN);

  core.info(`Reverting commit "${commitToRevert}" on branch "${branchForRevert}"...`);
  const { data: lastCommit } = await octokit.rest.repos.getCommit({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: branchForRevert
  });

  await octokit.rest.git.updateRef({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: `heads/${branchForRevert}`,
    sha: lastCommit.sha,
    force: true
  });

  await octokit.rest.git.createCommit({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    message: `Revert "${lastCommit.commit.message}"`,
    tree: lastCommit.commit.tree.sha,
    parents: [lastCommit.sha],
  });

  core.info(`Commit "${commitToRevert}" has been reverted on branch "${branchForRevert}"`);
}
