# Email safe-sending (Gmail account protection)

**Goal:** inbox delivery + keep `hameedabdulhameed42@gmail.com` from spam/ban.

Personal Gmail is **not** a bulk cold-email tool. Google watches bounce rate, complaint rate, send speed, and copy sameness. Burst-sending identical pitches burns the account.

## Hard limits (agent must obey)

| Rule | Limit |
| --- | --- |
| New cold sends / calendar day | **max 20** |
| Gap between cold sends | **≥ 4 minutes** (never parallel / burst) |
| Per timer cycle (30 min) | **max 2** new cold emails |
| After a bounce / block | **stop new cold for 2 hours**; mark BOUNCED |
| If ≥3 bounces in 24h | **pause all new cold until next calendar day** |
| Same body text | never reuse verbatim — rotate variants |
| Sunnyside / DO-NOT-CONTACT | never |

**Today (28 Nov):** volume was already high + multiple hard bounces.  
→ **Cool-down: no new cold sends until 29 Nov UK morning** unless Hameed explicitly lifts it.  
→ Agent **may still** watch inbox and reply to real humans (yes / price / no).

## Why mail was going to spam / failing

1. **Burst sends** — 6–8 messages within seconds (spam pattern).
2. **Near-identical templates** — same subject pattern + same body.
3. **Hard bounces** — invalid scraped Gmail addresses tank reputation.
4. **Empty From name** — send-as has blank `displayName` (looks like a bot).
5. **No signature** — consumer Gmail with no identity footer.

## Before any more cold email (Hameed — 5 min in Gmail)

1. **Gmail → Settings → Accounts → Send mail as**  
   Set name to something real, e.g. `Hameed · Ironsight` (not blank).
2. **Settings → General → Signature**  
   Short plain-text: name, Ironsight, city, optional phone. No URL shorteners.
3. Prefer **replying** to people who write back over blasting more cold.
4. Long-term: move cold outreach to a **custom domain** + Google Workspace or a proper ESP (Instantly / Smartlead / MailerSend) with SPF/DKIM/DMARC. Personal `@gmail.com` will always be fragile for cold.

## Copy rules (inbox-friendly)

- Plain text only (no HTML blasts, no tracking pixels, no big image).
- 4–7 short sentences. One ask. No “ACT NOW”, ALL CAPS, or emoji walls.
- Personalize first line with **real** business name + street/town.
- Rotate subject + body from `emails/06-website-cold-variants.md`.
- Never BCC lists. One recipient per message.
- Never send to an address that already bounced.

## Bounce handling

On `mailer-daemon` / “Address not found” / “Message blocked”:

1. Mark row `BOUNCED` in `NEW-CLIENTS-SENT.csv`.
2. Do not retry that address.
3. Count toward the 24h bounce pause if ≥3.

## Agent loop (updated)

1. Search inbox for NEW-client replies only.
2. Close yes/price or polite-close no/has-site.
3. **If cool-down active or daily cap hit:** hunt leads into a queue file only — **do not send**.
4. When sending is allowed: max 2, ≥4 min apart, variant copy, then log + commit.
5. Prefer walk/call sheet for cash — email is secondary.
