import * as express from 'express';
import * as bodyParser from 'body-parser';

import {getCherryPickConflictStatus} from './check-pr';

/** The body of the request for POST requests to the /check_pr handler. */
interface CheckPrRequest {
  pr: string;
  repo: string;
  owner: string;
  branch: string;
}

/** The port to listen for HTTP requests on. */
const PORT = process.env.PORT || 8080;
/** The express application instance. */
const httpServer = express();

// Since POST requests send all data in the body, it needs to be parsed as a
// JSON object to be easily accessed.
httpServer.use(bodyParser.json());

// Handle POST requests at /check_pr.
httpServer.post('/check_pr', (request: express.Request, response: express.Response) => {
  const options = request.body as CheckPrRequest;
  const {pr, repo, owner, branch} = options;

  // All responses should be JSON responses.
  response.setHeader('content-type', 'application/json');
  // Using the Cache-Control header, prevent caching of requests.
  response.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

  // Check if all parameters are provided.
  if (!pr || !repo || !branch || !owner) {
    response.status(400);
    response.send({status: 'missing_params', message: `Missing required parameter(s)`});
    return;
  }
  
  response.send(getCherryPickConflictStatus(owner, repo, pr, branch));
});

// Handle all GET requests.
httpServer.get('/*', (req: express.Request, res: express.Response) => {
  res.status(200);
  res.send('Requests to the presubmit-service module must be made via POST request.');
});

// Start listening on the port for requests.
httpServer.listen(PORT, () => {
  console.log(`App initialized.`);
  console.log(`Listening on port: ${PORT}`);
});
