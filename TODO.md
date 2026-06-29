- [x] Read tab layout + tab screens to identify overlay/touch interception for iPhone unclickable bottom navbar

- [x] Rebuild tabs layout from minimal Expo Router Tabs options to isolate blocker

- [ ] Remove/avoid any iOS stacking changes that do not help (zIndex/elevation/absolute) and instead fix root cause
- [ ] Add iOS-specific test adjustments (safe-area/pointerEvents) after minimal baseline works
- [ ] Keep rebuild changes to only tab layout files unless blocker is found in modal/other overlay
- [x] Re-run build and test iPhone tab taps

- [ ] Re-check Google key leak policy (ensure only env-based keys; do not commit secrets)

