import * as firebase from 'firebase-admin';

import {getConfig, BranchManagerRepoConfig, BranchManagerRepoConfigBranch} from './repo-config'
import {BranchManagerPullRequest} from './pull-request'

/** Retrieve the target branch for a pull request based on the repos config. */
export async function getBranchForPullRequest(
    configId: string, pullRequestRef: firebase.firestore.DocumentReference):
    Promise<BranchManagerRepoConfigBranch> {
  const configDoc = await getConfig(configId);
  const pullRequestDoc = await pullRequestRef.get();
  if (configDoc.exists && pullRequestDoc.exists) {
    const config = configDoc.data() as BranchManagerRepoConfig;
    const pullRequest = pullRequestDoc.data() as BranchManagerPullRequest;
    return config.branches.find(branch => pullRequest.labels.includes(branch.label));
  }
}
