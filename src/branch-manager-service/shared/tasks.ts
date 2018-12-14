import * as firebase from 'firebase-admin';
import {PubSub} from '@google-cloud/pubsub';

import {setStatusOnGithub} from './github';
import {
  getConfig,
  BranchManagerRepoConfig,
  getBranchForPullRequest,
  BranchManagerPullRequest
} from './firestore-models'

const presubmitPrTaskPublisher = (new PubSub()).topic('presubmit-pr-task').publisher()

/** 
 * Creates a presubmit task via pubsub for the pull request, if the application is enabled for
 * the repo and the pull request has one of the target labels.
 */
export async function createPresubmitTask(
    repoId: string, pullRequestRef: firebase.firestore.DocumentReference) {
  const config = (await getConfig(repoId)).data() as BranchManagerRepoConfig;
  if (!config || !config.enabled) {
    return;
  }
  const branch = await getBranchForPullRequest(repoId, pullRequestRef);
  if (branch) {
    const pullRequest = (await pullRequestRef.get()).data() as BranchManagerPullRequest;
    // Set a pending status on github for the sha.
    await setStatusOnGithub(
      pullRequest.org, pullRequest.repo, pullRequest.latestCommitSha, 'pending');
    // Create a task to determine the status of the presubmit and publish the task via pubsub.
    const data = JSON.stringify({
      org: pullRequest.org,
      repo: pullRequest.repo,
      pr: pullRequest.pullRequestNumber,
      branch: branch.branchName,
      sha: pullRequest.latestCommitSha
    });
    await presubmitPrTaskPublisher.publish(Buffer.from(data));
  }
}
