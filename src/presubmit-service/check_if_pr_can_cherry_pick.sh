#! /bin/bash
# TODO(josephperrott): Determine what should be loged to stderr and stdout accross
# the script.

# The owner of the repo to be checked against, e.g. angular
owner=$1
# The repo to be checked against, e.g. material2
repo=$2
# The PR number to retrieve the patch files for, e.g. 1234
pr=$3;
# The branch in the repo to check for cherry-picking onto, e.g. 6.1.x
branch=$4;
# The fullname of the repository to be checked against, e.g. angular/material2
full_repo="${owner}/${repo}"
# Whether the PR can be cherry-picked on to the targetted branch.
result=false;

# If the needed tmp directories don't exist, create them.
[ ! -d "/tmp/presubmit_service/$full_repo" ] && mkdir -p /tmp/presubmit_service/$full_repo;

# If the local_repo directory does not exist, create it.
[ ! -d ".presubmit_service/local_repo" ] && mkdir -p .presubmit_service/local_repo;
cd .presubmit_service/local_repo;

# If the current directory is not a toplevel of a git repo, initialize a repo and create
# a dummy commit in it to create a local remote with a master branch.  This is necessary
# because if no history exists in the default remote, github automatically attempts to
# use the master from the first remote that is checked out from.
if [ "$(git rev-parse --show-toplevel)" != "$(pwd)" ]; then
  git init 2>&1;
  touch empty_repo 2>&1;
  git add * 2>&1;
  git commit -a -m "empty repo" 2>&1;
fi

# If the repo does not exist in the list of repos for the local git repo, add it
# to the remotes.
git remote get-url $full_repo  2>&1;
if [ $? -ne 0 ]; then
  git remote add $full_repo "https://github.com/$full_repo.git" 2>&1;
fi

# Fetch for the targeted repo.
git fetch --depth 1 $full_repo $branch 2>&1;

# Retrieve the patch file for the PR from github.
curl -L -s https://github.com/$full_repo/pull/$pr.diff > /tmp/presubmit_service/$full_repo/$pr.diff;

# Checkout the targeted branch from the repo in a "detached HEAD" state.
git checkout $full_repo/$branch 2>&1;

# Check if the patch file can be applied to the checked out branch, if it can
# be set the result to be successful.
OUTPUT=$(git apply --check /tmp/presubmit_service/$full_repo/$pr.diff);
if [ $? -eq 0 ]; then
    result=true;
fi
echo $OUTPUT;
echo $OUTPUT 2>&1;

# Clean up the state of the local repo by removing the temp file and checkout the
# local master branch to abandon the "detached HEAD" branch that was created.
rm /tmp/presubmit_service/$full_repo/$pr.diff;
git checkout master 2>&1;

# Communicate the result of the check via the exit code.
if [ "$result" = "true" ]; then
  exit 0;
else
  exit 1;
fi
