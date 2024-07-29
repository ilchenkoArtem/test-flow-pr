import {$} from 'bun';
import * as core from '@actions/core';
import * as github from '@actions/github';

interface AddGitConfigArgs {
  gitHubToken: string;
}

export const addGitConfig = async ({gitHubToken}: AddGitConfigArgs) => {
  core.info(`Adding git config...`);
  const repoFullName = `${github.context.repo.owner}/${github.context.repo.repo}`;
  await $`git remote set-url origin https://x-access-token:${gitHubToken}@github.com/${repoFullName}.git`
  await $`git config --global user.email "github-actions[bot]@users.noreply.github.com"`
  await $`git config --global user.name "github-actions[bot]"`
  core.notice(`Git config has been added`)
}
