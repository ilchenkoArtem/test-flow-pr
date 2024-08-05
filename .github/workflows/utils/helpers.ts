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
    const parsedValue = JSON.parse(env);

    if (parsedValue === "string") {
      exitWithError(`Failed to parse environment variable "${key}" as JSON. Error: Parsed value ${parsedValue} is a string`);
    }

    return parsedValue;
  } catch (error) {
    exitWithError(`Failed to parse environment variable "${key}" as JSON. Error: ${error}`);
  }
}

export const exitWithError = (message: string): void => {
  core.setFailed(message);
  process.exit();
}

/**
 * Get octokit instance
 *
 * You should set GITHUB_TOKEN in your environment variables
 * in your workflow file before using this function
 */
export const getOctokit = () => {
  return github.getOctokit(getEnv("GITHUB_TOKEN"));
}
