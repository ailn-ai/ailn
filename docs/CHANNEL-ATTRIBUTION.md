# Channel attribution proposal

Design only; no tracking deployed.

Allowlisted sources: skills-sh, clawhub, binance-skills, dappbay, mcp-registry,
meshkore, direct. Medium: directory/referral. Campaign: data-20261105. Normalize
lowercase ASCII, reject unknown values and values over 32 characters. Never include
queries, wallet addresses, signatures, IPs or PII. Never forward UTMs upstream.

With consent where required, keep first/last touch for seven days under a random
session ID. Without consent keep no attribution identifier. Proposed retention:
delete event data after 30 days, operator-only access, deletion by session ID.
Owner policy review and private backend implementation remain prerequisites.

| Event | Evidence and deduplication |
| --- | --- |
| landing | Rendered page; session/source/day |
| skill_install_intent | Outbound click; never an install |
| skill_installed | Voluntary client confirmation after hash verification; event ID |
| mcp_discovery | Successful schemas response; request ID |
| demo_started | Accepted submission; run ID |
| demo_completed | Non-empty COMPLETED result, zero charge; run ID |
| paid_attempt | Intent/challenge only; never revenue |
| verified_paid_settlement | Successful chain receipt plus matching completed service; chain/tx/log index |

Report click-to-trial and trial-to-verified-payment separately. Without voluntary
reports installs remain unknown. Directory counters are separate platform metrics.
Exclude CI and local testing from customer conversion. Before release test missing
and malicious UTMs, no consent, expiry, repeats, ad blockers, empty/failed trials
and duplicate/reorged receipts. No payment rules or wallet identity linkage change.
