import {getConfig, BranchManagerRepoConfigBranch} from './repo-config';
import {BranchManagerPullRequest} from './pull-request';

/** Retrieve the target branch for a pull request based on the repos config. */
export async function getBranchesForPullRequest(
    repoId: number, pullRequestRef: FirebaseFirestore.DocumentReference):
    Promise<BranchManagerRepoConfigBranch[]> {
  const config = await getConfig(repoId);
  const pullRequestDoc = await pullRequestRef.get();
  if (config.enabled && pullRequestDoc.exists) {
    const pullRequest = pullRequestDoc.data() as BranchManagerPullRequest;
    return config.branches.filter(branch => pullRequest.labels.includes(branch.label));
  }
  return [];
}
