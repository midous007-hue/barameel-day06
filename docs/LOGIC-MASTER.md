# BARAMEEL WORLD — LOGIC MASTER

## 1. World hierarchy

BARAMEEL WORLD is the brand-level hub, not a synonym for BARAMEEL RUN.

RUN, DUO LINK, MENU, POST and MY BARAMEEL are separate experiences sharing one Player ID.

## 2. BARAMEEL RUN

`Choose runner → progress → scan universal QR → server reward → collection → points → progress`

A completed collection can lead into the competitive/routing layer later:

`completion → leaderboard/rank → WALK TO BARAMEEL → route/checkpoints → final Barameel QR`

The route layer is intentionally not faked in this static master until the mapping provider and Barameel destination coordinates are finalized.

## 3. Universal QR

The printed QR is universal. It is not a piece ID.

A production scan requires a valid server-side scan ticket. The server consumes the ticket atomically before resolving a reward.

The reward can be:

- a missing collection piece;
- a duplicate with a defined duplicate value;
- points/bonus;
- a configured reward/voucher.

Weighted reward configuration is server-side and can be changed without reprinting the QR.

## 4. Cross-device identity

The player ID is the persistent identity. LocalStorage is only a cache. Points, pieces, rewards, tickets and Duo Link results must be stored server-side.

## 5. Duo Link

Duo Link is not dating and is not a public chat system.

`Player A scans Player B code → server normalizes pair → checks pair history → creates one result → reward`

The same pair cannot repeatedly farm new results.

## 6. BARAMEEL POST

Post is a physical/social communication feature:

`choose postcard → recipient details → Barameel contacts recipient → recipient is told a Barameel post arrived → recipient receives a Barameel reward/voucher`

It is not a news feed and not an events page.

## 7. Target outcome

All experiences are designed to create measurable engagement and, where applicable, convert digital participation into visits to Barameel.
