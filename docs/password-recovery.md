# Password recovery operations

Production sends password recovery through Resend using
`Leadly Security <security@leadly.tryhanabi.com>`. The sender domain is
`leadly.tryhanabi.com`; its authoritative DNS is Namecheap.

## Sender verification

1. Open Resend's Domains page and select `leadly.tryhanabi.com` in the account
   associated with production's `RESEND_API_KEY`.
2. Compare Resend's required DNS records with Namecheap's `tryhanabi.com` zone.
   The return-path records are:

   | Type | Host          | Value                                   | Priority |
   | ---- | ------------- | --------------------------------------- | -------- |
   | TXT  | `send.leadly` | `v=spf1 include:amazonses.com ~all`     |          |
   | MX   | `send.leadly` | `feedback-smtp.us-east-1.amazonses.com` | 10       |

   Keep the DKIM public-key TXT record at `resend._domainkey.leadly` and any
   additional sending records exactly as displayed in Resend. Do not replace
   unrelated mail or website DNS records.

3. If the records already resolve correctly, trigger verification again. Wait
   until Resend reports the domain and required sending records as verified.
4. Submit one production forgot-password request to an authorized test account.
   Check that Resend accepts the message and reports `delivered`. Confirm the
   reset link uses `https://leadly.tryhanabi.com/reset-password`.

On October 1, 2026, the required records were already correct. Re-verification
changed the domain from `partially_failed` to `verified`, and Resend delivered
the test recovery email. No DNS or sender environment change was needed.

## Application behavior

The route middleware owns authentication request limits. It counts every request
once, including failed validation and unavailable accounts. Password recovery
allows three requests per IP and email per hour; verification resend allows two
per five minutes. Registration allows five requests per hour.

Recovery returns the same generic success message for existing and unavailable
accounts. A successful HTTP response alone does not prove email delivery; inspect
the provider event and sanitized backend errors when diagnosing delivery.

Reset links expire after one hour and contain a token whose SHA-256 hash is stored
in PostgreSQL. A successful reset clears the token and revokes account sessions.
The public form requires 8–32 characters with uppercase, lowercase, a number,
and a special character, and rejects reuse of the current password.
