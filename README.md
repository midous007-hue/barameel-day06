# BARAMEEL WORLD — MASTER PROJECT V17

This repository is the clean master build for the current BARAMEEL digital experience.

## Current architecture

BARAMEEL WORLD is the main hub. It contains separate experiences:

- BARAMEEL RUN — active production path in this build.
- BARAMEEL DUO LINK — social QR-to-QR experience; UI shell is present, final artwork/flow is not yet supplied.
- BARAMEEL MENU — reserved for the food/menu experience; final artwork is not yet supplied.
- BARAMEEL POST — postcard + envelope + Barameel stamp communication/reward experience; final artwork is not yet supplied.
- MY BARAMEEL — player identity/progress area; final artwork is not yet supplied.

The project is intentionally English-only at this stage. Language selection will be added before the localized UI is finalized.

## Non-negotiable QR architecture

There is ONE printed gameplay QR:

`BARAMEEL-UNIVERSAL`

The printed QR does not encode a collection, image, piece, player, or reward. Every legitimate scan is resolved server-side against the player's scan entitlement/ticket.

Flow:

`ONE QR → PLAYER → SCAN TICKET → SERVER-SIDE DRAW → PIECE / BONUS / REWARD → PLAYER ACCOUNT`

The client never decides the production reward and never uses the old per-piece QR system.

## Removed from this master

- All old per-piece/per-image QR assets.
- Legacy QR parsing.
- Client-side random reward fallback.
- Legacy `collection|image|piece` scan behavior.
- Screen 07 / duplicate rewards screen.
- Old instructions that treat a printed QR as a specific puzzle piece.

## Player state

Production source of truth is the backend/database. Browser localStorage is only a cache for UI continuity.

Player state includes:

- BARAMEEL Player ID / code
- runner/avatar
- total points
- weekly points
- rank / player count
- checkpoints
- collections / pieces
- scan history
- rewards
- Duo Link history
- last seen / analytics events

This is required so the same player can move between devices without losing collections.

## BARAMEEL RUN sequence

`WORLD SPLASH → WORLD → RUN → RUN START → RUNNER SELECT → PROGRESS/REWARDS → SCAN → COLLECTIONS`

Existing collection system remains 10 master images × 9 pieces for the current ALEXANDRIA collection. More collections can be added without changing the printed QR.

## Camera

The scanner keeps the camera inside the designed QR frame. It uses native `BarcodeDetector` when available and jsQR as a fallback. It accepts only the universal BARAMEEL QR format.

## Audio

The current arcade audio bank is retained:

- tap.wav
- select.wav
- confirm.wav
- back.wav
- scan.wav
- error.wav
- completion-arcade.wav
- reward-levelup.mp3

## GitHub Pages

The static UI can be hosted directly on GitHub Pages. The production reward/identity system requires the backend described in `docs/BACKEND-SETUP.md`.

Do not expose database service-role keys in GitHub Pages.

## Uploading artwork

Use `ASSET-MANIFEST.txt` as the only current upload instruction. Do not create extra QR images. Do not rename approved assets.


V17 UI regression fix: restored proven V12 runner-start, scanner, collection and classic arcade interaction geometry/audio behavior while retaining V16 server-first Universal QR architecture. Printed QR remains BARAMEEL-UNIVERSAL; scan entitlement/ticket is server-side.
