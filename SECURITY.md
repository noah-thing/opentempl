# Security

Please do not report security problems in a public issue. Use [private vulnerability reporting](https://github.com/noah-thing/opentempl/security/advisories/new) on GitHub instead, with steps to reproduce. You will get an answer within a few days.

Areas where a report matters most:

- The sharing relay in `sync/` and the end to end encryption in `apps/editor/src/collab/`.
- The anonymous counter and email list in `stats/`.
- Opening files made by someone else: `.opentempl`, PowerPoint and PDF imports.
- The Unsplash proxy in `api/`.
