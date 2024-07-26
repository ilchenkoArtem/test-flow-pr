import * as core from '@actions/core';

export const processError = (message: string) => {
  core.setFailed(message);
}

