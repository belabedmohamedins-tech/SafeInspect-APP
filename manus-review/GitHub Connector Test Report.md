# GitHub Connector Test Report

**Author:** Manus AI  
**Test date:** 17 August 2026

## Executive result

The GitHub integration is present in the current session and marked **enabled** as a built-in connector. Its registered description is: “Access, search, and organize repos, track issues, review pull requests, and automate workflows directly in Manus.”

The connector could not be invoked through the local callable-server interface in this sandbox: the local registry exposed only a session-reference server, and a direct lookup for a GitHub server returned “server not found.” Therefore, no data in the sample below should be represented as connector-fetched data. Instead, I performed a separate, safe, unauthenticated **read-only public GitHub API fallback** to demonstrate the kind of information the connector is intended to work with. No repository, issue, pull request, workflow, or account data was modified.

| Check | Result | Notes |
|---|---|---|
| Connector present | Passed | GitHub appears in the session connector registry. |
| Connector enabled | Passed | It is enabled and marked as a built-in, non-editable integration. |
| Connector tool discovery | Not available | No callable GitHub server was exposed to the local interface. |
| Read-only GitHub data retrieval | Passed via fallback | Public repository metadata and three issues were fetched from GitHub’s REST API. |
| Write-operation test | Not attempted | Deliberately avoided creating, editing, merging, or deleting anything. |

## Representative data retrieved

The fallback request queried the public repository [octocat/Hello-World](https://github.com/octocat/Hello-World) and its first three issues in the current API ordering.

| Repository field | Retrieved value |
|---|---:|
| Full name | `octocat/Hello-World` |
| Description | My first repository on GitHub! |
| Visibility | Public |
| Stars | 3,767 |
| Forks | 6,510 |
| Open issues | 6,893 |
| Default branch | `master` |
| Updated at | 2026-08-17 03:58:02 UTC |

| Issue | Title | State | Comments |
|---:|---|---|---:|
| 10872 | Test Issue 1786939083 | Open | 0 |
| 10871 | [test] write permission probe | Open | 1 |
| 10870 | API permission test (ignore) | Closed | 0 |

The issue titles and bodies indicate automated-test artifacts. They were treated as data only; no action was taken on them.

## Capability brief

The connector is intended to let Manus work with GitHub in natural language rather than requiring the user to manually navigate every page. Its advertised scope covers repository discovery and organization, issue tracking, pull-request review, and workflow automation. GitHub’s official REST documentation confirms that the underlying service supports integrations, data retrieval, and workflow automation across resource families such as repositories, issues, pull requests, repository contents, and Actions workflows.[1] [2] [3] [4] [5]

Actual access depends on the GitHub authorization available to the connector. Public data may be readable without account access, whereas private repositories and write actions require appropriate authentication and permissions.[1]

## How to use it

Once the connector is callable and authorized, useful prompts can be phrased as direct requests. For example:

> “List my GitHub repositories, showing the name, visibility, primary language, stars, and last update.”

> “For `OWNER/REPO`, summarize open issues grouped by label and identify the oldest unassigned issue.”

> “Review the open pull requests in `OWNER/REPO`; summarize the purpose, changed files, review status, and any requested changes.”

> “Show the latest failed GitHub Actions runs for `OWNER/REPO`, including the workflow name, branch, commit, and failure time.”

> “Find repositories I can access that mention `keyword` in their name or description.”

For safety, keep the first request read-only. Before asking Manus to create an issue, comment, approve or merge a pull request, dispatch a workflow, change repository settings, or modify files, review the proposed target and scope carefully.

## Recommended next step

To complete a true connector-level test, the GitHub built-in integration needs to be exposed to the current task’s callable tools or reconnected in the Manus web interface. After that, the ideal sequence is: discover the available GitHub operations, run a read-only request such as listing accessible repositories, and only then consider a narrowly scoped write test with explicit confirmation.

## References

[1]: https://docs.github.com/en/rest — GitHub REST API documentation.  
[2]: https://docs.github.com/en/rest/repos/repos — REST API endpoints for repositories.  
[3]: https://docs.github.com/en/rest/issues/issues — REST API endpoints for issues.  
[4]: https://docs.github.com/en/rest/pulls/pulls — REST API endpoints for pull requests.  
[5]: https://docs.github.com/en/rest/actions/workflows — REST API endpoints for GitHub Actions workflows.
