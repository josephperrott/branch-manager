"use strict"
// This shim file is in to allow for the service to work as expected in the cloud function
// execution environment.  The entire directory from where `gcloud functions deploy` is uploaded
// to the cloud storage bucket to be containerized.  Cloud functions when triggered spin up
// the container and execute a script at index.js.  Since our tsc build output is put into
// a dist/ directory, a shim is needed to reexport the githubEvents function from an index.js
// file in the root of the container.
exports.githubEvents = require("./dist/github-event-service/index").githubEvents;
