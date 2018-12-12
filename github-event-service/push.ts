import * as fetch from 'node-fetch';
import {safeLoad as parseYaml} from 'js-yaml';

import {getFirebaseInstance} from '../shared/firebase-common';
import {BranchManagerRepoConfig, getConfigRef, updateConfigRef} from '../shared/firestore-models'
import {GithubPushEvent} from '../shared/github'

/** The Firebase app. */
const firestore = getFirebaseInstance().firestore();

/** Handle webhook events from github of the type, `push`. */
export async function handlePushEvent(event: GithubPushEvent) {
  if (isMasterBranchRef(event.ref)) {
    await syncRepoConfigFromSource(event);
  }
  // TODO(josephperrott): Handle pushes to non-master branches.
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

/** Whether the branch ref string is tagged as the master branch. */
function isMasterBranchRef(branchRef: string) {
  return branchRef === 'refs/tags/master';
}
