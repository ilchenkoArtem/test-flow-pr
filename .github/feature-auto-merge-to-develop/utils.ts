import * as core from '@actions/core';

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
