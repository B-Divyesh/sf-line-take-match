# Demo sandbox

- URL: <https://line-take-match.sociobot.in/?demo=1> (the clean `/demo/` route opens the same sandbox).
- Sample: three recordings of the fictional “door warning” line. The first screen shows Take 01, Take 02, their level difference, and an approved-then-candidate play action. Take 01 is approved, Take 02 has a longer pause, and Take 03 is faster and flagged.
- Storage: demo changes use IndexedDB database `demo:line-take-match`. The normal app uses `line-take-match`; demo mode never opens it.
- Reset: **Reset demo** clears the demo database and restores the three original takes.
- Exit: **Start for real** clears the demo database before opening the normal empty take list.
- Offline: the sample audio and app shell are generated locally or precached. After the first visit, the demo reloads without a network connection.
