Utilities for working with structured commit messages.

## Format

In Verbi, we use the following format:

```
[level][scope: ]<title>

[body]
```

Examples:

```
tigris: fix something
+ add new apis
+ tigris-timeout: add
- remove obsolete apis
```

### Level

Level component of the commit message can be used by release automation tools to figure out which [SemVer](https://semver.org/#semantic-versioning-200) version part should be incremented by a release including this commit. It must have one of the following values:

- empty: PATCH
- `+`: MINOR
- `-`: MAJOR

### Scope

Scope specifies the files edited by this commit. If provided, it must be either an identifier of a Verbi module, a path to a file or a directory.

In general, a commit should only modify the files matched by its scope:

- if the scope is a file, only this file should be edited
- if the scope is a directory, only its contents should be edited
- if the scope is a Verbi module, only this module's files should be edited

But there are a few exceptions to this rule:

- when changing a module's API or renaming some exported symbols, dependent files may be edited
- unmatched files may be edited automatically. For instance, installing npm dependencies edits `package.json` and `pnpm-lock.yaml`

### Title

Title provides a brief explaination to the commit. It must be written in the imperative form such as "change X" but not "changed X" or "changes X".

### Body

Body must be separated from the commit message head with two line feed characters. It may provide any detailed information about the commit.
