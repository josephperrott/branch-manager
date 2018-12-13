import * as fetch from 'node-fetch';
import {safeLoad as parseYaml} from 'js-yaml';

import {
  BranchManagerRepoConfig,
  getConfigRef,
  updateConfigRef,
  getBranchByBranchName
} from '../shared/firestore-models'
import {GithubPushEvent} from '../shared/github'

/** The regular expression for retrieving the branch from a ref property in the GithubPushEvent */
const branchRefRegExp = /(?:refs\/heads\/)(\w*)/;

/** Handle webhook events from github of the type, `push`. */
export async function handlePushEvent(event: GithubPushEvent) {
  if (isMasterBranchRef(event.ref)) {
    await syncRepoConfigFromSource(event);
  }
  if (await isTargetedBranchRef(`${event.repository.id}`, event.ref)) {
    // TODO(josephperrott): Create a presubmit task for all pull requests for the target
  }
}

/** 
 * Update the config object in firestore for the repo from the event if the
 * config has changed.
 */
export async function syncRepoConfigFromSource(event: GithubPushEvent) {
  /** Firestore ref for the instance of the config doc. */
  const configRef = await getConfigRef(`${event.repository.id}`);
  /** The config object loaded from the repo via github. */
  const newConfig = await getRepoConfigFromGithub(event.repository.full_name);
  updateConfigRef(configRef, newConfig);
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
async function isTargetedBranchRef(configId: string, branchRef: string) {
  const branchName = getBranchNamefromGitRef(branchRef);
  return !!(await getBranchByBranchName(configId, branchName)); 
}
