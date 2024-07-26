import * as github from '@actions/github';
import process from 'node:process';

export const getOctokit = (token: string) => github.getOctokit(process.env.GITHUB_TOKEN);

