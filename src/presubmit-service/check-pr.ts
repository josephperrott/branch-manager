import * as shell from 'shelljs';

/** Determine if the PR can apply to a repo's targeted branch. */
export const getCherryPickConflictStatus = 
    (owner: string, repo: string, pr: string, branch: string) => {
  // TODO(josephperrott): Use stderr/stdout output from the script to fill in the message property
  // values in the returned object.
  const prCheck = shell.exec(
    `${__dirname}/check_if_pr_can_cherry_pick.sh ${owner} ${repo} ${pr} ${branch}`);
  if (prCheck.code === 0) {
    return {status: 'success', message: '', branchName: branch};
  } else {
    return {status: 'failure', message: '', branchName: branch};
  }
};
