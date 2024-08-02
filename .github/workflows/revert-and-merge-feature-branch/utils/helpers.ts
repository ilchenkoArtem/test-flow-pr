import * as core from '@actions/core';
import * as github from '@actions/github';

export const getEnv = (key: string) => {
  const value = process.env[key];
  if (value === undefined) {
    exitWithError(`Environment variable "${key}" is not set`);
  }

  return value.trim();
}


export const getEnvJson = <T = string>(key: string): T => {
  const env = getEnv(key);

  try {
    return JSON.parse(env);
  } catch (error) {
    exitWithError(`Failed to parse environment variable "${key}" as JSON. Error: ${error}`);
  }
}

export const exitWithError = (message: string): void => {
  core.setFailed(message);
  process.exit();
}

export const getOctokit = () => {
  return github.getOctokit(getEnv("GITHUB_TOKEN"));
}
