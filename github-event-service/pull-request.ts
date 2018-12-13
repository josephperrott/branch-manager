import * as firebase from 'firebase-admin';
import {GithubPullRequestEvent} from '../shared/github';
import {
  getOrCreatePullRequestRef,
  deletePullRequestRef,
  updatePullRequestRef,
  getBranchByLabel,
  getBranchForPullRequest,
  getConfig,
  BranchManagerRepoConfig,
  BranchManagerPullRequest
} from '../shared/firestore-models';
import {sendPresubmitTaskToPubSub} from '../shared/tasks'

/**
 * Handle webhook events from github of the type, `pull_request`.  Based on the action of 
 * the event, updates or deletes the Pull Request document in firestore.
 */
export async function handlePullRequestEvent(event: GithubPullRequestEvent) {
  const repoId = `${event.repository.id}`;
  const pullRequestRef = await getOrCreatePullRequestRef(event);
  const pullRequest = {
    org: event.organization.login,
    repo: event.repository.name,
    pullRequestNumber: `${event.number}`,
    labels: event.pull_request.labels.map(label => label.name),
    latestCommitSha: event.pull_request.head.sha,
  };
  switch (event.action) {
    // Event Actions which will always require a task to be created.
    case 'synchronize':
    case 'opened':
    case 'reopened':
      await updatePullRequestRef(pullRequestRef, pullRequest);
      await createPresubmitTask(repoId, pullRequestRef);
      break;
    // Event Actions which will sometimes require a task to be created.
    case 'labeled':
      await updatePullRequestRef(pullRequestRef, pullRequest);
      if (await getBranchByLabel(repoId, event.label.name)) {
        await createPresubmitTask(repoId, pullRequestRef);
      }
      break;
    // Event Actions which will never require a task to be created.
    case 'unlabeled':
      await updatePullRequestRef(pullRequestRef, pullRequest);
      break;
    case 'closed':
      await deletePullRequestRef(pullRequestRef);
      break;
  }
}

/** 
 * Creates a presubmit task for the pull request, if the application is enabled for
 * the repo and the pull request has one of the target labels.
 */
async function createPresubmitTask(
  repoId: string, pullRequestRef: firebase.firestore.DocumentReference) {
    const repoDoc = await getConfig(repoId);
    if (!repoDoc.exists) {
      return;
    }
    const repoConfig = (await getConfig(repoId)).data() as BranchManagerRepoConfig;
    if (!repoConfig.enabled) {
      return;
    }
    const branch = await getBranchForPullRequest(repoId, pullRequestRef);
    if (branch) {
      const pullRequest = (await pullRequestRef.get()).data() as BranchManagerPullRequest;
      await sendPresubmitTaskToPubSub(
        pullRequest.org, pullRequest.repo, pullRequest.pullRequestNumber, branch.branchName, 
        pullRequest.latestCommitSha);
    }
  }
