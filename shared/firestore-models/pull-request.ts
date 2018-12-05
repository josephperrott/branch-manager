
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
