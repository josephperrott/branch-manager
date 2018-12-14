import * as fetch from 'node-fetch';
import * as functions from 'firebase-functions';

import {setStatusOnGithub} from '../shared/github';

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
  .onPublish(async message => {
    const {org, repo, pr, branch, sha} = message.json;
    const url = `https://presubmit-service-dot-branch-manager.appspot.com/check_pr`;
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({org, repo, pr, branch, sha})
    }
    try {
      const response = await fetch(url, config).then(response => response.json());
      await setStatusOnGithub(org, repo, sha, response.status);
    } catch (e) {
      await setStatusOnGithub(
        org, repo, sha, 'failure', 
        'The PR does not cleanly cherry-pick onto the targetted branch');
    }
  });
