import {getConfig, BranchManagerRepoConfig, BranchManagerRepoConfigBranch} from './repo-config';
import {BranchManagerPullRequest} from './pull-request';

/** Retrieve the target branch for a pull request based on the repos config. */
export async function getBranchesForPullRequest(
    configId: string, pullRequestRef: FirebaseFirestore.DocumentReference):
    Promise<BranchManagerRepoConfigBranch[]> {
  const configDoc = await getConfig(configId);
  const pullRequestDoc = await pullRequestRef.get();
  if (configDoc.exists && pullRequestDoc.exists) {
    const config = configDoc.data() as BranchManagerRepoConfig;
    const pullRequest = pullRequestDoc.data() as BranchManagerPullRequest;
    return config.branches.filter(branch => pullRequest.labels.includes(branch.label));
  }
  return [];
}
