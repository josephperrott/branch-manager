import {
  PullsGetResponse,
  OrgsGetResponse,
  ReposGetResponse,
  IssuesGetLabelResponse
} from '@octokit/rest';
import * as fetch from 'node-fetch';

import {githubToken} from '../../../.config/project-config.json';

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
  repository: ReposGetResponse;
};


/** 
 * The Github pull_request webhook event from
 * https://developer.github.com/webhooks/#payloads
 */
interface PullRequestEvent { 
  action: PullRequestEventActions;
  number: number;
  organization: OrgsGetResponse;
  pull_request: PullsGetResponse
  repository: ReposGetResponse;
};

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
  label: IssuesGetLabelResponse;
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
  org: string, repo: string, sha: string, state: 'error' | 'failure' | 'pending' | 'success',
  description: string = '', target_url: string = '', context: string = 'branch-manager') {
  const url = `https://api.github.com/repos/${org}/${repo}/statuses/${sha}`;
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${githubToken}`,
    },
    body: JSON.stringify({state, target_url, description, context})
  };
  await fetch(url, config);
}
