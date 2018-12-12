import {GithubPullRequestEvent} from '../shared/github';
import {
  getOrCreatePullRequestRef,
  deletePullRequestRef,
  updatePullRequestRef,
  hasTargetedLabel,
  isConfiguredTargetLabel
} from '../shared/firestore-models';

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
    latestCommitSha: event.pull_request.merge_commit_sha,
    currentStatus: ''
  };
  switch (event.action) {
    // Event Actions which will always require a task to be created.
    case 'synchronize':
      await updatePullRequestRef(pullRequestRef, pullRequest);
      // TODO(josephperrott): Create a task for checking the pull request.
      break;
    // Event Actions which will sometimes require a task to be created.
    case 'labeled':
      await updatePullRequestRef(pullRequestRef, pullRequest);
      if (await isConfiguredTargetLabel(repoId, event.label.name)) {
        // TODO(josephperrott): Create a task for checking the pull request.
      }
      break;
    case 'opened':
      await updatePullRequestRef(pullRequestRef, pullRequest);
      if (await hasTargetedLabel(repoId, pullRequestRef)) {
        // TODO(josephperrott): Create a task for checking the pull request.
      }
      break;
    case 'reopened':
      await updatePullRequestRef(pullRequestRef, pullRequest);
      if (await hasTargetedLabel(repoId, pullRequestRef)) {
        // TODO(josephperrott): Create a task for checking the pull request.
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

