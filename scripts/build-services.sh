# Remove old build from the dist/ directory
rm -rf dist/;
# Build javascript files from typscript sources
tsc -b tsconfig.json;
# Copy non-compiled files from their source to their expected locations
cp .config/github-app-key.pem dist/.config/;
cp src/presubmit-service/check_if_pr_can_cherry_pick.sh dist/src/presubmit-service/;
cp src/presubmit-service/app.yaml ./;