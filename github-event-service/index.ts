import * as express from 'express';

import {handlePushEvent} from './push';

/** 
 * Handle events from github webooks.
 * 
 * The expected events from Github are `pull_request` and `push`.
 */
export const githubEvents = async (request: express.Request, response: express.Response) => {
  response.setHeader('Content-Type', 'application/json');
  // Github descibes what the type of the webhook event trigger was, and thus
  // what the structure of the request payload will be via the X-Github-Event
  // payload .
  const githubEventType: string = request.header('X-Github-Event');
  switch (githubEventType) {
    case 'pull_request':
      // TODO(josephperrott): Handle when a pull request is updated.
      response.send({result: 'Request was pull_request'});
      break;
    case 'push':
      await handlePushEvent(request.body);
      response.send({result: 'Request was push'});
      break;
    default:
      response.send({result: 'Unknown github event type'});
  }
}
