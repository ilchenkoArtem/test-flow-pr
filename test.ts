import * as core from '@actions/core';
import * as github from '@actions/github';

const token = process.env.GITHUB_TOKEN;
const octokit = github.getOctokit(token);



