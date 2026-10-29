# Portfolio analytics

Appwrite Analytics starts once in `src/hooks.client.ts`, using the shared client, Singapore endpoint, project `6adf4e1e00316521b4f6`, and property `6ae0a115002177037121`.

Collection runs only on `adityaoberai.com` and `www.adityaoberai.com` in production builds. The SDK's default Do Not Track behavior applies to automatic and custom events. Browser tests intercept Appwrite requests so test traffic does not reach the property.

The SDK handles pageviews, outbound links, PDF/DOCX downloads, scroll depth, and active engagement time. Extensionless resume routes have a download fallback; direct file URLs use the SDK listener. There is no additional router pageview hook.

## Custom events

| Event                    | Trigger                                                                                                     | Properties                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `contact_section_viewed` | Contact controls become at least 50% visible in an active tab, or the room's contact reader opens           | `section`                                 |
| `contact_clicked`        | Email, speaking invitation, contact-page/panel entry, meeting link, contact-area profile, or newsletter CTA | `method`, `purpose`, `section`            |
| `content_clicked`        | Project, work, essay, talk, podcast, community, collection, photo-source, or room-section link              | `type`, `content_id`, `action`, `section` |
| `resume_clicked`         | PDF or legacy DOCX resume link, including redirect aliases                                                  | `format`, `section`                       |
| `speaker_bio_copied`     | Speaker bio successfully written to the clipboard                                                           | `section`                                 |
| `speaker_asset_clicked`  | Headshot link                                                                                               | `asset`, `section`                        |
| `room_station_opened`    | Station opens, including a mobile preview                                                                   | `station`                                 |
| `room_station_viewed`    | Station's full reader opens                                                                                 | `station`                                 |
| `room_curiosity_opened`  | A curiosity note or bed/poem preview opens                                                                  | `curiosity`                               |
| `room_poem_viewed`       | Full poem reader opens                                                                                      | `curiosity`                               |
| `room_menu_opened`       | Room menu opens                                                                                             | `section`                                 |
| `room_setting_changed`   | Visitor changes low power/less motion or resets the view                                                    | `setting`, `value`                        |
| `music_toggled`          | Visitor puts the record on or stops it                                                                      | `state`: `on` / `off`                     |
| `music_playback_changed` | SoundCloud reports a transition into playing or from playing to paused                                      | `state`: `playing` / `paused`             |
| `mode_switched`          | Existing mode-switch invitations or the large On paper room invitation                                      | `from`, `to`                              |
| `photo_viewed`           | A photo becomes selected in the viewer                                                                      | `photo_id`, `scope`                       |

The event URL is supplied by the SDK. `section` identifies the entry point, such as `contact_page`, `index`, `footer`, `speaking_page`, `projects_page`, or `room_notebook`. Artifact IDs match across room readers and dedicated pages. Room section links use the destination path and fragment as `content_id` (for example, `/projects` or `/work#developer-relations`), retaining the source station in `section`; external destinations also include their origin. Query strings are omitted from section destination IDs. Contact methods include email, meeting, LinkedIn, GitHub, GitHub Sponsors, X, Instagram, newsletter, Pexels, and Collectr. Email purpose distinguishes general contact from a speaking invitation. Modified room-menu contact activations identify `contact_page`; only an unmodified primary click identifies `contact_panel`.

Contact views fire once per mounted contact area; the persistent footer resets for each pathname. Mobile station/bed previews do not count as full reader views. Collapsing and reopening the same reader, resizing, or repeated identical SoundCloud playback updates do not repeat the corresponding view/playback event. Fully closing and opening a reader starts a new view.

Link events measure intent to open a resource, not a completed email, subscription, meeting, or download. Keyboard activation and middle-click are included for custom link events; right-click alone is ignored. No visitor-entered text, email addresses, clipboard contents, or music track data are added as custom properties.

## Extending coverage

Content links use `data-content-type` and `data-content-id` on an anchor or enclosing item, with an optional `data-content-action` on the anchor. `Row` accepts the same metadata through its `tracking` prop. Add `data-analytics-section` to the surrounding page or reader to preserve attribution.

Contact groups use `data-contact-section`; newsletter CTAs outside those groups use `data-contact-method="newsletter"`. The `contactVisibility` action observes actual contact controls. Pass the current pathname when the controls persist across page navigation, as the footer does.

Run `npm run check`, `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e -- tests/browser/analytics.spec.ts tests/browser/mode.spec.ts` to validate changes.
