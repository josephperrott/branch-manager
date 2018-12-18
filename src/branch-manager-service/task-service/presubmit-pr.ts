import * as fetch from 'node-fetch';
import * as functions from 'firebase-functions';

import {setStatusOnGithub} from '../shared/github';
import {PresubmitPrTaskData} from '../shared/tasks'

interface PrCheckResult {
  branchName: string;
  status: string;
  message: string;
}

/** 
 * The handler function for a presubmit pr tasks triggered by messages on the 
 * 'presubmit-pr-task' pubsub topic.
 * 
 * Checks the if the pr is able to be cherry-picked cleanly to its target branch, and
 * set the status on github as a result.
 */
export const handlePresubmitPrTask = functions
  .pubsub
  .topic('presubmit-pr-task')
  .onPublish(async (message: functions.pubsub.Message) => {
    const {org, repo, pr, branches, sha} = message.json as PresubmitPrTaskData;
    const url = `https://presubmit-service-dot-branch-manager.appspot.com/check_pr`;
    try {
      const results = await Promise.all(branches.map(branch => {
        const body = JSON.stringify({org, repo, pr, branch, sha});
        return fetch(url, buildRequestConfig(body)).then(response => response.json());
      }));      
      await setStatusOnGithub(org, repo, sha, ...buildGithubStatus(results));
    } catch (e) {
      await setStatusOnGithub(
        org, repo, sha, 'failure', 
        'The PR was unable to be checked by the cherry pick checking service');
    }
  });

/** 
 * Build result information from results from the PR check request, building an array
 * with the result and description string.
 */
function buildGithubStatus(results: PrCheckResult[]): ['failure' | 'success', string] {
  // Whether all of the PR Checks are passing.
  let passing = 1;
  const branchResults = results.map(result => {
    passing &= result.status === 'success' ? 1 : 0;
    return `${result.branchName}: ${result.status}`;
  }).join(' | ');
  return [
    passing ? 'success' : 'failure',
    `Checked ${results.length} branch${results.length !== 1 ? 'es': ''}  —  ${branchResults}`
  ]
}

/**
 * Builds the config object for the request to the presubmit service.
 */
function buildRequestConfig(body: string) {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  };
}