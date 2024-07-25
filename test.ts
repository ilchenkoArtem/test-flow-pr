import * as core from '@actions/core';


const githubToken = core.getInput('GITHUB_TOKEN', { required: true });

console.log('githubToken', githubToken + "t");
