import * as core from '@actions/core';
import * as github from '@actions/github';

export const isValidJson = (jsonString: string | undefined | null): boolean => {
  if (!jsonString) return false;

  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}


export function getEnv(key: string, required: false): string | null;
export function getEnv(key: string, required: true): string;
export function getEnv(key: string): string;
export function getEnv(key: string, required = true): string | null {
  const value = process.env[key];
  if (!value && required) {
    exitWithError(`Environment variable "${key}" is not set`);
  }
  if (value === undefined) return null;
  return value.trim();
}

export function getEnvJson<T = string>(key: string, required: false): T | null;
export function getEnvJson<T = string>(key: string, required: true): T;
export function getEnvJson<T = string>(key: string): T;
export function getEnvJson<T = string>(key: string, required = true): T | null {
  const env = getEnv(key,  required as true);
  if (env === null) return null;

  if (isValidJson(env)) {
    return JSON.parse(env) as T;
  }

  exitWithError(`Failed to parse environment variable "${key}" as JSON. Value: "${env}"`);
  process.exit();
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
