# BACKEND SETUP

The static GitHub Pages frontend cannot securely implement global player identity, one-time scan tickets, server-side random rewards, leaderboards, or anti-farming rules by itself.

The included `supabase/schema.sql` is the production data model starting point.

Required API routes:

- POST /player — create/sync player identity.
- POST /scan — atomically consume ticket and draw reward server-side.
- POST /analytics — record events.
- POST /duo-link — create a one-time pair result.

Recommended production flow for a scan:

1. Verify player session.
2. Verify the supplied ticket belongs to that player and is available.
3. Atomically consume the ticket.
4. Select a reward from the active weighted reward pool.
5. Insert the scan record with an idempotency key.
6. Insert the piece if new and update points.
7. Return the resulting player state and reward.

If the request is repeated with the same idempotency key, return the original result instead of awarding again.

The client should never receive database service-role credentials.
