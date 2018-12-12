import * as firebase from 'firebase-admin';

import {getConfig, BranchManagerRepoConfig} from './repo-config'
import {BranchManagerPullRequest} from './pull-request'

/** Determine when a label is one of the target labels based on the repos config. */
export async function isConfiguredTargetLabel(configId: string, label: string) {
  const configDoc = await getConfig(configId);
  if (configDoc.exists) {
    const config = configDoc.data() as BranchManagerRepoConfig;
    return !!config.branches.find(branch => branch.label === label);
  }
  return false;
}

/** Determine if a pull request as one of the targeted labels based on the repos config. */
export async function hasTargetedLabel(
  configId: string, pullRequestRef: firebase.firestore.DocumentReference) {
    const configDoc = await getConfig(configId);
    const pullRequestDoc = await pullRequestRef.get();
    if (configDoc.exists && pullRequestDoc.exists) {
      const config = configDoc.data() as BranchManagerRepoConfig;
      const pullRequest = pullRequestDoc.data() as BranchManagerPullRequest;
      return !!config.branches.find(branch => pullRequest.labels.includes(branch.label));
    }
    return false;
  }
