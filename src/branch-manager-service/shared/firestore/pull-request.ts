import {GithubPullRequestEvent} from '../github';
import {firestore} from '../firebase';

/** 
 * Metadata for pull requests as stored in the Branch Manager's firestore.
 * 
 * The BranchManagerPullRequest only stores the information about the pull
 * request that is of concern for the application rather.
 */
export interface BranchManagerPullRequest {
  // The labels currently applied to the pull request.
  labels: string[];
  // The sha of latest commit on the pull request.
  latestCommitSha: string;
  // The owner of the pull requests's repository, either an organization or github account.
  owner: string;
  // The pull request number.
  pullRequestNumber: string;
  // The repository the pull request belongs to.
  repo: string;
}

/** Gets a reference to the Pull Request document, creating the document if none exists. */
export async function getOrCreatePullRequestRef(
  event: GithubPullRequestEvent): Promise<FirebaseFirestore.DocumentReference> {
  const pullRequestQueryResult = await firestore
    .collection('pull_requests')
    .where('owner', '==', event.repository.owner.login)
    .where('repo', '==', event.repository.name)
    .where('pullRequestNumber', '==', `${event.number}`).get();
  if (pullRequestQueryResult.size) {
    return pullRequestQueryResult.docs[0].ref;
  }
  return firestore.collection('pull_requests').doc();   
}

/** Deletes the Pull Request document from firestore.  */
export async function deletePullRequestRef(pullRequestRef: FirebaseFirestore.DocumentReference) {
  await pullRequestRef.delete();
}

/** Updates all the fields in the Pull Request document.  */
export async function updatePullRequestRef(pullRequestRef: FirebaseFirestore.DocumentReference,
                                           pullRequest: Partial<BranchManagerPullRequest>) {
  await pullRequestRef.set(pullRequest, {merge: true}); 
}

export async function getPullRequestsByLabel(owner: string, repo: string, label: string) {
  const queryResult = await firestore
    .collection('pull_requests')
    .where('owner', '==', owner)
    .where('repo', '==', repo)
    .where('labels', 'array-contains', label).get();
  return queryResult.docs;
}
