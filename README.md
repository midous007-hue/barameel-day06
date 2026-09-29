# BARAMEEL WORLD V18 FINAL

V18 is a precision correction build based on the approved V12 scanner/collection geometry and the later universal-QR/server architecture.

Key fixes:
- Screen 05 live camera is constrained to the exact dark QR viewport inside the supplied artwork.
- QR detection uses BarcodeDetector for qr_code only, plus jsQR fallback; detector failures fall back instead of silently looping.
- Screen 06 artwork is explicitly contained at the supplied 953x1649 aspect ratio; no intrinsic-size cropping.
- Classic BARAMEEL arcade audio assets are used for UI sounds; generated fallback tones were removed from normal UI feedback. Character selection retains distinct square-wave motifs.
- Universal QR remains BARAMEEL-UNIVERSAL. No legacy per-piece QR system is restored.

Backend is still intentionally unconfigured until Supabase/API deployment is completed.
