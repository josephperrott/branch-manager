import * as firebase from 'firebase-admin';

import {GithubPullRequestEvent} from '../github';
import {getFirebaseInstance} from '../firebase-common';

/** The Firebase app's firestore database. */
const firestore = getFirebaseInstance().firestore();

/** 
 * Metadata for pull requests as stored in the Branch Manager's firestore.
 * 
 * The BranchManagerPullRequest only stores the information about the pull
 * request that is of concern for the application rather.
 */
export interface BranchManagerPullRequest {
  currentStatus: string;
  labels: string[];
  latestCommitSha: string;
  org: string;
  pullRequestNumber: string;
  repo: string;
};

/** Gets a reference to the Pull Request document, creating the document if none exists. */
export async function getOrCreatePullRequestRef(
  event: GithubPullRequestEvent): Promise<firebase.firestore.DocumentReference> {
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

/** Deletes the Pull Request document from firestore.  */
export async function deletePullRequestRef(pullRequestRef: firebase.firestore.DocumentReference) {
  await pullRequestRef.delete();
}

/** Updates all the fields in the Pull Request document.  */
export async function updatePullRequestRef(pullRequestRef: firebase.firestore.DocumentReference,
                                           pullRequest: Partial<BranchManagerPullRequest>) {
  await pullRequestRef.set(pullRequest, {merge: true}); 
}
