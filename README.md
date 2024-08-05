## Our default flow
1. Create `feature` branch from `main`
2. Develop your feature
3. Create a PR from `feature` to `develop` branch with title `feat(FL-1111): your feature`
4. Merge PR

Then our test team will test the `develop` branch and if we have `bug`, do the next steps:

1. Go to `feature` branch
2. Fix bugs
3. Find the previous PR for `feature` branch and copy the title
4. Create a PR from `feature` to `develop` branch with 
the title from the previous title and add the bug task to the title `feat(FL-1111, FL-1112): your feature`
5. Revert the previous squashed commit in `develop` branch from `feature` branch
6. Merge PR

### Problems:
- Manual revert of previous changes in the `develop` branch
- We have a lot of PRs, and we need to merge them manually
- Don't forget to update the title of the PR (it is important for squashing commits)
- On each new PR, reviewers see all changes for this branch. It is hard to review all changes in one PR
- After reverting changes in the `develop` branch, we can review new changes a lot of times, 
and QA teams can't continue testing because we reverted the
`feature` from the `develop` branch

## Our flow with changes in this project
1. Create `feature` branch from `main`
2. Develop your feature
3. Create a PR from `feature` to `develop` branch with title `feat(FL-1111): your feature`
4. Merge PR

Then our test team will test the `develop` branch and if we have `bug`, do the next steps:

1. Create `fix/FL-1112` branch from `feature` branch
2. Fix bugs in the `fix` branch
3. Create a PR from `fix` to `feature` branch with title `fix(FL-1112): your fix`
4. Merge PR

All next actions will be done automatically after merging the PR from `fix` to `feature` branch:
- Revert the previous squashed commit in `develop` branch from `feature` branch
- Create a PR from `feature` to `develop` branch with the title from the previous title and add the bug task to the title `feat(FL-1111, FL-1112): your feature`
- Merge PR
