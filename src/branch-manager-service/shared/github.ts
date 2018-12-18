import * as GithubApi from '@octokit/rest'; 

import {githubToken} from '../../../.config/project-config.json';

/** The Github Api instance to interact with the Github REST api. */
const github = new GithubApi();

// Set the Authentication using the github token.
github.authenticate({type: 'token', token: githubToken});

/** 
 * The Github push webhook event from
 * https://developer.github.com/webhooks/#payloads
 */
export interface GithubPushEvent { 
  ref: string;
  head: string;
  before: string;
  size: number;
  distinct_size: number;
  commits: Array<{
    sha: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
    url: string;
    distinct: boolean;
  }>;
  repository: GithubApi.ReposGetResponse;
}


/** 
 * The Github pull_request webhook event from
 * https://developer.github.com/webhooks/#payloads
 */
interface PullRequestEvent { 
  action: PullRequestEventActions;
  number: number;
  organization: GithubApi.OrgsGetResponse;
  pull_request: GithubApi.PullsGetResponse;
  repository: GithubApi.ReposGetResponse;
}

enum PullRequestEventActions {
  Closed = 'closed',
  Labeled = 'labeled',
  Opened = 'opened',
  Reopened = 'reopened',
  Synchronize = 'synchronize',
  Unlabeled = 'unlabeled',
}

interface PullRequestEventClosed extends PullRequestEvent {
  action: PullRequestEventActions.Closed;
}

interface PullRequestEventLabeled extends PullRequestEvent {
  action: PullRequestEventActions.Labeled;
  label: GithubApi.IssuesGetLabelResponse;
}

interface PullRequestEventOpened extends PullRequestEvent {
  action: PullRequestEventActions.Opened;
}

interface PullRequestEventReopened extends PullRequestEvent {
  action: PullRequestEventActions.Reopened;
}

interface PullRequestEventSynchronize extends PullRequestEvent {
  action: PullRequestEventActions.Synchronize;
}

interface PullRequestEventUnlabeled extends PullRequestEvent {
  action: PullRequestEventActions.Unlabeled;
}

export type GithubPullRequestEvent =
  PullRequestEventClosed |
  PullRequestEventLabeled |
  PullRequestEventOpened |
  PullRequestEventReopened |
  PullRequestEventSynchronize |
  PullRequestEventUnlabeled;


/** Pushes a status to github for a commmit. */
export async function setStatusOnGithub(
    owner: string, repo: string, sha: string, state: 'error' | 'failure' | 'pending' | 'success',
    description: string = '', target_url: string = '', context: string = 'branch-manager') {
  const statusParams: GithubApi.ReposCreateStatusParams = {
    context, description, owner, repo, sha, state, target_url 
  };
  return github.repos.createStatus(statusParams);
}
