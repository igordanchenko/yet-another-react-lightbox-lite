# Contributing

Thank you for taking the time to contribute to
`yet-another-react-lightbox-lite`.

## Code of Conduct

`yet-another-react-lightbox-lite` has adopted the
[Contributor Covenant](https://www.contributor-covenant.org/) as its Code of
Conduct, and we expect project participants to adhere to it. Please read
[the full text](CODE_OF_CONDUCT.md) so that you can understand what actions will
and will not be tolerated.

## Submitting an Issue

Open an issue at
<https://github.com/igordanchenko/yet-another-react-lightbox-lite/issues>.
Please include:

- `yet-another-react-lightbox-lite`, React, browser, and OS versions.
- A minimal repro — ideally a fork of the
  [StackBlitz template](https://stackblitz.com/edit/yet-another-react-lightbox-lite?file=src%2FApp.tsx)
  with the slides, props, and any custom render callbacks needed to reproduce
  the bug.
- For gesture or zoom issues, the input device (mouse, touchpad, touchscreen)
  and the sequence of interactions that triggered the bug.

For security issues, **do not open a public issue** — see
[`SECURITY.md`](SECURITY.md).

## Sending a Pull Request

1. For non-trivial changes, open an issue first to align on the approach.
2. Fork the repository and create a topic branch from `main`.
3. Add tests for any behavior changes — the suite enforces 100% coverage on
   `src/`.
4. Run `npm run ci` locally — it must pass before you submit.
5. Open a PR, link the issue if applicable, and describe what changed and why.

### Setup

```sh
git clone https://github.com/igordanchenko/yet-another-react-lightbox-lite.git
cd yet-another-react-lightbox-lite
npm install
```

### Scripts

| Script            | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start the Vite dev server from `dev/`            |
| `npm test`        | Run the Vitest suite                             |
| `npm run test:ui` | Run Vitest with the interactive UI               |
| `npm run lint`    | Run ESLint                                       |
| `npm run build`   | Build CSS + JS into `dist/`                      |
| `npm run size`    | Print the minified + gzipped JS bundle size      |
| `npm run ci`      | Build + test + lint (what CI runs on every push) |

To run a single test file or match by name:

```sh
npx vitest run test/Lightbox.spec.tsx
npx vitest run -t "name substring"
```

### Commit messages

Commits must follow
[Conventional Commits](https://www.conventionalcommits.org/). `commitlint` runs
on every commit via Husky and will reject messages that don't conform.

Prefer narrow, focused commits — semantic-release derives the version bump and
changelog entry from each commit's type and body.

Common types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`, `build`.

### Code style

- ESLint and Prettier run on staged files via `lint-staged`. You normally don't
  need to run them manually — the pre-commit hook formats and fixes on its own.
- If a hook fails, fix the reported issue and re-stage rather than bypassing
  with `--no-verify`.
- `no-console` is an error. Unused variables are allowed only when prefixed with
  `_`.

### Tests

Vitest runs in a `jsdom` environment. `test/test-utils.tsx` provides render
helpers, element selectors, and gesture simulation utilities; prefer them over
ad-hoc DOM queries so tests stay consistent.

Coverage thresholds are 100% on `src/**` (excluding `index.ts`, `types.ts`, and
`.d.ts` files). When adding behavior, add a test that exercises it through the
public component API rather than calling internal helpers directly.

### Releases

Releases are automated by
[semantic-release](https://github.com/semantic-release/semantic-release) on
merges to `main`, with prereleases cut from `next`. You do not need to bump the
version or edit `CHANGELOG.md`.

## Testing changes in a local project

As an alternative to the Vite dev server, you can link-install your local build
into another project. Because React must be deduplicated, the link has to cover
`react` and `react-dom` as well:

```sh
# in this repository — start the watch build
npm run start
```

```sh
# in your project
YARLL_HOME=../yet-another-react-lightbox-lite
npm link "$YARLL_HOME" "$YARLL_HOME/node_modules/react" "$YARLL_HOME/node_modules/react-dom"
rm -rf node_modules/.cache
```

To clean up:

```sh
# in your project
npm rm -g yet-another-react-lightbox-lite react react-dom
npm install
rm -rf node_modules/.cache
```

## License

By contributing code to this repository, you agree to license your contributions
under the project's [MIT License](LICENSE).
