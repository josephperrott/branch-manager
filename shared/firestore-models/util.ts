import * as firebase from 'firebase-admin';

import {getConfig, BranchManagerRepoConfig} from './repo-config'
import {BranchManagerPullRequest} from './pull-request'

/** Determine when a label is one of the target labels based on the repos config. */
export async function isConfiguredTargetLabel(configId: string, label: string): Promise<boolean> {
  const configDoc = await getConfig(configId);
  if (configDoc.exists) {
    const config = configDoc.data() as BranchManagerRepoConfig;
    return !!config.branches.find(branch => branch.label === label);
  }
  return false;
}

/** Retrieve the target branch for a pull request based on the repos config. */
export async function getTargetBranch(
    configId: string, pullRequestRef: firebase.firestore.DocumentReference): Promise<string> {
  const configDoc = await getConfig(configId);
  const pullRequestDoc = await pullRequestRef.get();
  let target = {
    branch: '',
    label: ''
  }
  if (configDoc.exists && pullRequestDoc.exists) {
    const config = configDoc.data() as BranchManagerRepoConfig;
    const pullRequest = pullRequestDoc.data() as BranchManagerPullRequest;
    target = config.branches.find(branch => pullRequest.labels.includes(branch.label)) || target;
  }
  return target.branch;
}

/** Determine if a pull request as one of the targeted labels based on the repos config. */
export async function hasTargetedLabel(
    configId: string, pullRequestRef: firebase.firestore.DocumentReference): Promise<boolean> {
  return !!(await getTargetBranch(configId, pullRequestRef));
}
