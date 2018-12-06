import * as express from 'express';
import * as bodyParser from 'body-parser';
import {PRESUBMIT_PR_URL, handlePresubmitPrTask} from './tasks/presubmit-pr';


/** The port to listen for HTTP requests on. */
const PORT = process.env.PORT || 8080;
/** The express application instance. */
const httpServer = express();

// Since POST requests send all data in the body, it needs to be parsed as a
// JSON object to be easily accessed.
httpServer.use(bodyParser.json());

// Handle POST requests at the URL for a task.
httpServer.post(PRESUBMIT_PR_URL, handlePresubmitPrTask);

// Start listening on the port for requests.
httpServer.listen(PORT, () => {
  console.log(`App initialized.`);
  console.log(`Listening on port: ${PORT}`);
});
