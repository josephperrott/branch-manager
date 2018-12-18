import {PubSub} from '@google-cloud/pubsub';

import {setStatusOnGithub} from './github';
import {
  getConfig,
  getBranchesForPullRequest,
  BranchManagerPullRequest
} from './firestore';

/** The data object to publish on pubsub for a presubmit pr task. */
export interface PresubmitPrTaskData {
  owner: string;
  repo: string;
  pr: string;
  branches: string[];
  sha: string;
}

const presubmitPrTaskPublisher = (new PubSub()).topic('presubmit-pr-task').publisher();

/** 
 * Creates a presubmit task via pubsub for the pull request, if the application is enabled for
 * the repo and the pull request has one of the target labels.
 */
export async function createPresubmitTask(
    repoId: number, pullRequestRef: FirebaseFirestore.DocumentReference) {
  const config = await getConfig(repoId);
  if (!config || !config.enabled) {
    return;
  }
  const branches = await getBranchesForPullRequest(repoId, pullRequestRef);
  if (branches.length) {
    const pullRequest = (await pullRequestRef.get()).data() as BranchManagerPullRequest;
    // Set a pending status on github for the sha.
    await setStatusOnGithub(
      pullRequest.owner, pullRequest.repo, pullRequest.latestCommitSha, 'pending');
    // Create a task to determine the status of the presubmit and publish the task via pubsub.
    const data = JSON.stringify({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      pr: pullRequest.pullRequestNumber,
      branches: branches.map(branch => branch.branchName),
      sha: pullRequest.latestCommitSha
    });
    await presubmitPrTaskPublisher.publish(Buffer.from(data));
  }
}
