# Mini-study: learning or remembering?

Does the scientist agent actually **use the results** it gets back, or is it
**recalling** a dataset it may have seen in training? Three agent cells plus a
computed random floor answer that.

## Conditions

- **Random floor** — best-so-far under uniform sampling, Monte Carlo over the
  768 dataset values. Pure computation, free. The value of intelligence is the
  gap above it.
- **Agent, normal** — intact feedback, visible names.
- **Agent, scrambled feedback** — tests _"does it use the results?"_ A learner
  degrades; a memorizer doesn't notice (arXiv:2509.21403 failure mode).
- **Agent, hidden names** — tests _"does it use prior knowledge?"_ What survives
  is experimental skill.

Each agent cell is run `STUDY_REPEATS` times (default 3). The metric is the
best-so-far curve on the **true** measured conversion, averaged over repeats.

## Running

The random floor is free and has no dependencies:

```bash
pnpm -F @mono/experiment study:baseline
```

The agent study calls the model and **costs money**. It needs database,
gateway, and Redis credentials (Doppler) and a real user id to own the
campaigns:

```bash
STUDY_USER_ID=<user-id> doppler run -- pnpm -F @mono/experiment study
# optional: STUDY_MODEL=claude-sonnet-4.6 STUDY_REPEATS=3
```

Results are written to `study/results/`:

- `random-baseline.json` — the floor (committed; reproducible from seed 42).
- `study-results.json` — per-cell mean best-so-far curves (generated when you
  run the agent study).

The campaigns the study creates are real campaigns owned by `STUDY_USER_ID`;
they show up in the Lab UI like any other.
