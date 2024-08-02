import * as core from '@actions/core';
import * as github from '@actions/github';

export const getEnv = (key: string) => {
  console.trace(`Getting env variable ${key}`);
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

export const getOctokit = () => {
  return github.getOctokit(getEnv("GITHUB_TOKEN"));
}
