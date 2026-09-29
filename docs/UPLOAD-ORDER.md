# GITHUB UPLOAD ORDER — V16

1. Delete the old repository contents or use a completely new repository.
2. Upload the contents of this ZIP at repository root.
3. Do NOT upload any old `qr-codes/` directories.
4. Do NOT mix files from V12/V13 into this repository.
5. If runner art is not yet final, leave the named slots empty and upload the final files later using `ASSET-MANIFEST.txt`.
6. Keep `config.js` free of secrets. Set only the public backend base URL there when the backend is deployed.
7. Enable GitHub Pages from the repository root.
8. Verify `index.html` opens the BARAMEEL WORLD splash.
9. Verify RUN is the only currently active World experience.
10. Connect the production backend before expecting a QR scan to award a reward.

Production rule: no service-role database key belongs in this repository.
