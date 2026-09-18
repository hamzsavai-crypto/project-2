# project-2

Umbrella repo. The two sub-projects are included as git submodules, so their code and
history live in their own repositories and `project-2` only pins a specific commit of each.

## Submodules

| Path | Upstream | Pinned at |
| --- | --- | --- |
| `ANIMATe/` | [hamzsavai-crypto/ANIMATe](https://github.com/hamzsavai-crypto/ANIMATe) | `c7537f7` (tag `1.4.1`) |
| `VPL/` | [hamzsavai-crypto/VPL](https://github.com/hamzsavai-crypto/VPL) | `bd7144d` (`main`) |

## Getting started

Clone with the submodules in one step:

```bash
git clone --recurse-submodules https://github.com/hamzsavai-crypto/project-2.git
```

If you already cloned without them, or your submodules show up as empty folders:

```bash
git submodule update --init --recursive
```

## Day-to-day

Pull the latest upstream commit for each submodule and record the new pointer:

```bash
git submodule update --remote --merge
git add ANIMATe VPL
git commit -m "Bump submodule pointers"
```

Work on a sub-project as a normal git repo — `cd ANIMATe`, branch, commit, push.
The parent repo then only needs `git add ANIMATe && git commit` to point at the new commit.

To check every submodule is on a commit that is pushed (never pin a dangling SHA):

```bash
git submodule foreach 'git status --short --branch'
```
