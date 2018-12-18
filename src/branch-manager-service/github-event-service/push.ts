import * as fetch from 'node-fetch';
import {safeLoad as parseYaml} from 'js-yaml';

import {
  BranchManagerRepoConfig,
  updateConfig,
  getBranchByBranchName,
  getPullRequestsByLabel
} from '../shared/firestore';
import {GithubPushEvent} from '../shared/github';
import {createPresubmitTask} from '../shared/tasks';

/** The regular expression for retrieving the branch from a ref property in the GithubPushEvent */
const branchRefRegExp = /(?:refs\/heads\/)(\w*)/;

/** Handle webhook events from github of the type, `push`. */
export async function handlePushEvent(event: GithubPushEvent) {
  if (isMasterBranchRef(event.ref)) {
    await syncRepoConfigFromSource(event);
  }
  if (await isTargetedBranchRef(event.repository.id, event.ref)) {
    const pullRequests = await getPullRequestsByLabel(
      event.repository.owner.login, event.repository.name, getBranchNamefromGitRef(event.ref));
    const taskPromises = pullRequests.map(pullRequest => {
      return createPresubmitTask(event.repository.id, pullRequest.ref)
          .catch(err => ({error: err}));
    });
    await Promise.all(taskPromises);
  }
}

/** 
 * Update the config object in firestore for the repo from the event if the
 * config has changed.
 */
export async function syncRepoConfigFromSource(event: GithubPushEvent) {
  /** The config object loaded from the repo via github. */
  const newConfig = await getRepoConfigFromGithub(event.repository.full_name);
  updateConfig(event.repository.id, newConfig);
}

/** Retrieve the Repo Config from the github master branch for the repo.  */
export async function getRepoConfigFromGithub(fullName: string): Promise<BranchManagerRepoConfig> {
  /** The url for the raw config file from the repo. */
  const url = `https://raw.githubusercontent.com/${fullName}/master/.github/branch-manager.yml`;
  /** The config object loaded from the repo via github. */
  return await fetch(url, {}).then(result => result.text()).then(text => parseYaml(text));
}

/** Gets the branch name from branch ref string */
function getBranchNamefromGitRef(branchRef: string) {
  const regExpResult = branchRefRegExp.exec(branchRef);
  if (regExpResult) {
    return regExpResult[1];
  }
  return '';
}

/** Whether the branch ref string is the master branch. */
function isMasterBranchRef(branchRef: string) {
  return getBranchNamefromGitRef(branchRef) === 'master';
}

/** Whether the branch ref string is a branch targeted in the config. */
async function isTargetedBranchRef(repoId: number, branchRef: string) {
  const branchName = getBranchNamefromGitRef(branchRef);
  return !!(await getBranchByBranchName(repoId, branchName)); 
}
