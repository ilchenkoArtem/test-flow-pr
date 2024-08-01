import * as core from '@actions/core';
import * as github from '@actions/github';

export const getEnv = <T = string>(key: string): T => {
  const value = process.env[key];
  if (value === undefined) {
    core.setFailed(`Env variable ${key} is required`);
    process.exit(1);
  }

  if (value.startsWith("{") && value.endsWith("}")) {
    return JSON.parse(value.trim());
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
