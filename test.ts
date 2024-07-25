import * as core from '@actions/core';



const githubToken = core.getInput(process.env.GITHUB_TOKEN, { required: true });
console.log('githubToken', githubToken);
