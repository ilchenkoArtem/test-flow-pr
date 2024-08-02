import * as core from '@actions/core';
import * as github from '@actions/github';

export const getEnv = (key: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    exitWithError(`Env variable ${key} is required`);
  }
  return value.trim();
}


export const exitWithError = (message: string): void => {
  core.setFailed(message);
  process.exit();
}

export const getOctokit = () => {
  return github.getOctokit(getEnv("GITHUB_TOKEN"));
}

export const BASE_REQUEST_DATA = {
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
}
