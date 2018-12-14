| package.json commands |                                                                                      |
|          ---          |                                         ---                                          |
| `start`               | Starts the presubmit service webserver. Used by App Engine to start webserver.       |
| `lint`                | Runs linting over the entire repo.                                                   |
| `build`               | Cleans out the `dist/` directory and rebuilds all of the services.                   |
| `serve-github-event`  | Starts the githubEvent firebase function in the local functions emulator.            |
| `serve-task`          | Starts the handlePresubmitPrTask firesbase function in the local functions emulator. |
| `serve-presubmit`     | Starts the presubmit services locally.                                               |
| `deploy-github-event` | Deploys the githubEvent firebase function to the firebase app.                       |
| `deploy-task`         | Deploys the handlePresubmitPrTask firebase function to the firebase app.             |
| `deploy-presubmit`    | Deploys the presubmit service to App Engine.                                         |