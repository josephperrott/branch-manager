import * as firebase from 'firebase-admin';

import {getFirebaseInstance} from '../shared/firebase-common';
import {GithubPullRequestEvent} from '../shared/github-events';
import {BranchManagerPullRequest} from '../shared/firestore-models';

type DocumentReference = firebase.firestore.DocumentReference;

/** The Firebase app's firestore database. */
const firestore = getFirebaseInstance().firestore();

/**
 * Handle webhook events from github of the type, `pull_request`.  Based on the action of 
 * the event, updates or deletes the Pull Request document in firestore.
 */
export async function handlePullRequestEvent(event: GithubPullRequestEvent) { 
  const pullRequestRef = await getOrCreatePullRequestRef(event);
  const labels = event.pull_request.labels.map(label => label.name);
  switch (event.action) {
    case 'labeled':
      setLabelsForPullRequestRef(pullRequestRef, labels);
      break;
    case 'unlabeled':
      setLabelsForPullRequestRef(pullRequestRef, labels);
      break;
    case 'opened':
      setPullRequestInfoForPullRequestRef(pullRequestRef, event);
      break;
    case 'closed':
      deletePullRequestRef(pullRequestRef);
      break;
    case 'reopened':
      setPullRequestInfoForPullRequestRef(pullRequestRef, event);
      break;
    case 'synchronize':
      updateCommitShaForPullRequestRef(pullRequestRef, event.pull_request.merge_commit_sha);
      break;
  }
}

/** Updates the labels field in the Pull Request document. */
export async function setLabelsForPullRequestRef(pullRequestRef: DocumentReference,
                                                 labels: string[] = []) {
  const pullRequest: Partial<BranchManagerPullRequest> = {labels};
  await pullRequestRef.set(pullRequest, {merge: true}); 
}

/** Deletes the Pull Request document from firestore.  */
export async function deletePullRequestRef(pullRequestRef: DocumentReference) {
  await pullRequestRef.delete();
}

/** Updates the lastCommitSha for the Pull Request document. */
export async function updateCommitShaForPullRequestRef(pullRequestRef: DocumentReference,
                                                       sha: string) {
  const pullRequest: Partial<BranchManagerPullRequest> = {
    latestCommitSha: sha
  };
  await pullRequestRef.set(pullRequest, {merge: true});
}

/** Updates all the fields in the Pull Request document.  */
export async function setPullRequestInfoForPullRequestRef(pullRequestRef: DocumentReference,
                                                          event: GithubPullRequestEvent) {
  const pullRequest: Partial<BranchManagerPullRequest> = {
    org: event.organization.login,
    repo: event.repository.name,
    pullRequestNumber: `${event.number}`,
    labels: event.pull_request.labels.map(label => label.name),
    latestCommitSha: event.pull_request.merge_commit_sha,
    currentStatus: ''
  };
  await pullRequestRef.set(pullRequest, {merge: true}); 
}

/** Gets a reference to the Pull Request document, creating the document if none exists. */
export async function getOrCreatePullRequestRef(
    event: GithubPullRequestEvent): Promise<DocumentReference | null> {
  const pullRequestQueryResult = await firestore
    .collection('pull_requests')
    .where('org', '==', event.organization.login)
    .where('repo', '==', event.repository.name)
    .where('pullRequestNumber', '==', `${event.number}`).get();
  if (pullRequestQueryResult.size) {
    return pullRequestQueryResult.docs[0].ref;
  }
  return firestore.collection('pull_requests').doc();   
}
