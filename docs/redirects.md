# Redirect map for oberai.dev

Prepared 31 October 2026. Configure these redirects in the old domain's hosting or forwarding service. This change does not configure the domain.

Use a permanent **301 or 308** response and preserve the path and query string. For example, `https://oberai.dev/work` should redirect directly to `https://adityaoberai.com/work`. On review, both the old home and `/work` returned a temporary 302 to the new homepage.

## Page mappings

The first seven routes below were present in the previous conventional site's sitemap (`12cbe80`). The remaining routes are supported by the current site, so they can use the same forwarding rule.

| Source                           | Destination                            |
| -------------------------------- | -------------------------------------- |
| `https://oberai.dev/`            | `https://adityaoberai.com/`            |
| `https://oberai.dev/about`       | `https://adityaoberai.com/about`       |
| `https://oberai.dev/work`        | `https://adityaoberai.com/work`        |
| `https://oberai.dev/projects`    | `https://adityaoberai.com/projects`    |
| `https://oberai.dev/community`   | `https://adityaoberai.com/community`   |
| `https://oberai.dev/speaking`    | `https://adityaoberai.com/speaking`    |
| `https://oberai.dev/contact`     | `https://adityaoberai.com/contact`     |
| `https://oberai.dev/writing`     | `https://adityaoberai.com/writing`     |
| `https://oberai.dev/photography` | `https://adityaoberai.com/photography` |
| `https://oberai.dev/collection`  | `https://adityaoberai.com/collection`  |
| `https://oberai.dev/now`         | `https://adityaoberai.com/now`         |
| `https://oberai.dev/index`       | `https://adityaoberai.com/index`       |
| `https://oberai.dev/world`       | `https://adityaoberai.com/world`       |

`/world` stays available because it explicitly chooses room mode and supports shared room fragments such as `#mirror`. Its canonical URL is `/`. `/index` remains the separate On paper directory.

## Files and short links

| Source path on oberai.dev | Destination                            | Notes                                                    |
| ------------------------- | -------------------------------------- | -------------------------------------------------------- |
| `/resume`                 | `https://adityaoberai.com/resume.pdf`  | Direct to the PDF, avoiding a second redirect.           |
| `/resume/docx`            | `https://adityaoberai.com/resume.docx` | Preserve the existing Word download.                     |
| `/pic`                    | `https://adityaoberai.com/aditya.jpg`  | Direct to the headshot.                                  |
| `/meet`                   | `https://adityaoberai.com/meet`        | Let the new site manage the current meeting destination. |
| `/resume.pdf`             | `https://adityaoberai.com/resume.pdf`  | Existing file link.                                      |
| `/resume.docx`            | `https://adityaoberai.com/resume.docx` | Existing file link.                                      |
| `/aditya.jpg`             | `https://adityaoberai.com/aditya.jpg`  | Existing image link.                                     |
| `/og.png`                 | `https://adityaoberai.com/og.png`      | Existing share-image link.                               |
| `/favicon.ico`            | `https://adityaoberai.com/favicon.ico` | Existing icon link.                                      |
| `/sitemap.xml`            | `https://adityaoberai.com/sitemap.xml` | Current canonical content URLs.                          |

Apply the mapping to HTTP/HTTPS and bare/www variants of the old domain. Keep the old domain's robots.txt crawlable so crawlers can discover its redirects. Unknown paths should retain their path to the new site, which returns a real 404 for missing content, rather than all landing on the homepage.

After setup, check the status and Location headers for `/`, `/work`, `/speaking`, `/resume`, and a missing path. Confirm query strings and browser fragments survive forwarding. Verify both domains in Search Console, submit the new sitemap, and complete the Change of Address flow if it has not already been done.
