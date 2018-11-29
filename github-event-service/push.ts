import * as fetch from 'node-fetch';
import {safeLoad as parseYaml} from 'js-yaml';

import {getFirebaseInstance} from './firebase-common';

/** The configuration for the branch manager. */
export interface BranchManagerConfig {
  enabled: boolean;
  branches: Array<{
    branch: string;
    label: string;
  }>;
};

/** 
 * Limited implementation of the Github push webhook event from
 * https://developer.github.com/webhooks/#payloads
 */
export interface GithubPushEvent { 
  ref: string;
  repository: {
    id: number;
    full_name: string;
  }
};

/** The Firebase app. */
const firestore = getFirebaseInstance().firestore();

/** Handle webhook events from github of the type, `push`. */
export function handlePushEvent(event: GithubPushEvent) {
  if (isMasterBranchRef(event.ref)) {
    syncRepoConfigFromSource(event);
  }
  // TODO(josephperrott): Handle pushes to non-master branches.
}

/** 
 * Update the config object in firestore for the repo from the event if the
 * config has changed.
 */
export async function syncRepoConfigFromSource(event: GithubPushEvent) {
  // The document from the repo config collected for the repo, as identified by githubs repo id.
  const configDoc = firestore.collection('repo_configs').doc(`${event.repository.id}`);
  /** Firestore ref for the instance of the config doc. */
  const configRef = await configDoc.get();
  /** The config object loaded from the repo via github. */
  const newConfig = await getRepoConfig(event.repository.full_name);

  if (!configRef.exists || JSON.stringify(configRef.data()) !== JSON.stringify(newConfig)) {
    configDoc.set(newConfig);
  }
}

/** Retrieve the Repo Config from the github master branch for the repo.  */
export async function getRepoConfig(fullName: string): Promise<BranchManagerConfig> {
  /** The url for the raw config file from the repo. */
  const url = `https://raw.githubusercontent.com/${fullName}/master/.github/branch-manager.yml`;
  /** The config object loaded from the repo via github. */
  return await fetch(url, {}).then(result => result.text()).then(text => parseYaml(text));
}

/** Whether the branch ref string is tagged as the master branch. */
function isMasterBranchRef(branchRef: string) {
  return branchRef === 'refs/tags/master';
}
