import {GithubPullRequestEvent} from '../shared/github';
import {
  getOrCreatePullRequestRef,
  deletePullRequestRef,
  updatePullRequestRef
} from '../shared/firestore-models';


/**
 * Handle webhook events from github of the type, `pull_request`.  Based on the action of 
 * the event, updates or deletes the Pull Request document in firestore.
 */
export async function handlePullRequestEvent(event: GithubPullRequestEvent) { 
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
    case 'labeled':
      await updatePullRequestRef(pullRequestRef, pullRequest);
      break;
    case 'unlabeled':
      await updatePullRequestRef(pullRequestRef, pullRequest);
      break;
    case 'opened':
      await updatePullRequestRef(pullRequestRef, pullRequest);
      break;
    case 'closed':
      await deletePullRequestRef(pullRequestRef);
      break;
    case 'reopened':
      await updatePullRequestRef(pullRequestRef, pullRequest);
      break;
    case 'synchronize':
      await updatePullRequestRef(pullRequestRef, pullRequest);
      break;
  }
}


