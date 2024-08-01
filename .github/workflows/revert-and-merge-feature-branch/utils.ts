import * as core from '@actions/core';
import * as github from '@actions/github';

export const getEnv = (key: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    core.setFailed(`Env variable ${key} is required`);
    process.exit(1);
  }
  return value.trim();
}

export const exitWithError = (message: string): void => {
  core.setFailed(message);
  process.exit(1);
}

export const getOctokit = (): any => {
  return github.getOctokit(getEnv("GITHUB_TOKEN"));
}
