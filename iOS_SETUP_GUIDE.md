# 📱 iOS App Setup Guide - HouseFinance

There are **3 ways** to install HouseFinance on iOS:

---

## Option 1: Web App (Easiest - No Installation Needed) ⭐

**Time: 2 minutes**

### Steps:

1. **Open Safari on iPhone**
2. **Go to URL:**
   ```
   https://housefinance-app.vercel.app
   ```
   *(Once deployed, you'll get the actual URL)*

3. **Tap Share button** (bottom center)
4. **Select "Add to Home Screen"**
5. **Confirm Name** (shows "HouseFinance")
6. **App appears on home screen!**

### Features:
- ✅ No App Store needed
- ✅ Automatic updates
- ✅ Offline access (via Service Worker)
- ✅ Works like native app
- ✅ Camera/microphone access possible

### After Installation:
- Tap app icon to open
- Works in standalone mode (no Safari UI)
- Swipe to refresh if needed
- Share features work

---

## Option 2: iOS Web Clip (Shortcut) - 5 min

Best if you want a customized icon on home screen:

1. **Open Shortcuts app** on iPhone
2. **Create new shortcut:**
   - Tap "+" to create
   - Add action: "Open URL"
   - Paste: `https://housefinance-app.vercel.app`
   - Add action: "Ask for [List Selection]"
   - Add action: "Choose from list"
   - Set color and icon
3. **Save** with name "HouseFinance"
4. **Add to Home Screen** from share menu

---

## Option 3: Native iOS App (Using Capacitor) - 30 min

**For App Store distribution or native feel:**

### Requirements:
- Mac with Xcode (13+)
- Apple Developer account
- Git
- Node.js 16+

### Setup Steps:

#### 1. Install Capacitor:
```bash
npm install -g @capacitor/cli

# In project directory
npm install @capacitor/core @capacitor/app
```

#### 2. Initialize Capacitor:
```bash
npx cap init

# Prompts:
# App name: HouseFinance
# App ID: com.housefinance.app
```

#### 3. Update `vite.config.js` to ensure proper build:
```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
```

#### 4. Build web app:
```bash
npm run build
```

#### 5. Create `capacitor.config.json`:
```json
{
  "appId": "com.housefinance.app",
  "appName": "HouseFinance",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 0,
      "backgroundColor": "#06060f"
    }
  },
  "ios": {
    "contentInset": "automatic"
  }
}
```

#### 6. Add iOS platform:
```bash
npx cap add ios
```

#### 7. Open in Xcode:
```bash
npx cap open ios
```

#### 8. In Xcode:
1. **Select App project** on left
2. **Go to Signing & Capabilities**
3. **Add Apple Developer account:**
   - Click "+ Capability"
   - Search "Signing"
   - Select your team
4. **Bundle ID:** Should show `com.housefinance.app`
5. **Set Minimum iOS Version:** 13.0+

#### 9. Run on device:
1. **Connect iPhone via USB**
2. **Select device** (top left scheme dropdown)
3. **Press Play** (Cmd + R) to build and run

#### 10. Build for App Store (optional):
```bash
# From Xcode:
# 1. Product > Scheme > Edit Scheme
# 2. Set Build Configuration to "Release"
# 3. Product > Archive
# 4. Distribute App

# Or from command line:
xcodebuild archive \
  -scheme HouseFinance \
  -configuration Release \
  -archivePath build/HouseFinance.xcarchive
```

---

## Option 4: TestFlight (Beta Testing) - 20 min

**Share app with testers before App Store release:**

1. **Build for Archive** (see Option 3 step 10)
2. **Upload to App Store Connect**
3. **Create TestFlight group**
4. **Invite testers via email**
5. **Share TestFlight link**

Testers receive link, download TestFlight app, and install your app!

---

## Comparison Table

| Feature | Web App | Shortcut | Capacitor | TestFlight |
|---------|---------|----------|-----------|-----------|
| Installation | 2 min | 5 min | 30 min | 20 min |
| App Store | ❌ | ❌ | ✅ | ✅ (Beta) |
| Offline | ✅ | ✅ | ✅ | ✅ |
| Updates | Auto | Manual | Manual | Manual |
| Native Feel | ✅ | ✅ | ✅✅ | ✅✅ |
| No Account | ✅ | ✅ | ❌ | ❌ |
| Device Sync | ❌ | ❌ | ✅ | ✅ |

---

## Recommended Approach

### For Quick Testing: **Option 1 (Web App)**
- No setup needed
- Works immediately
- Share URL with anyone
- Best for initial testing

### For Beta Testing: **Option 4 (TestFlight)**
- Formal beta program
- Track feedback
- Easy to invite testers
- Professional

### For App Store: **Option 3 (Capacitor)**
- Full native capabilities
- App Store distribution
- Longer setup but worth it

---

## Features Available on iOS

### PWA (Web App) Features:
- ✅ Dark/Light mode
- ✅ Period filtering
- ✅ Transaction management
- ✅ Offline access
- ✅ Charts & analytics
- ✅ Camera (for photos)
- ✅ Notifications (ready)

### Native App Additional:
- ✅ Home screen icon
- ✅ Launch screen
- ✅ iOS-specific styling
- ✅ Platform-native UI
- ✅ Better performance
- ✅ App Store features

---

## Testing Checklist

After installation, test:

- [ ] App opens without errors
- [ ] Dashboard displays correctly
- [ ] Dark mode works
- [ ] Transactions load
- [ ] Can add transaction
- [ ] Can filter by period
- [ ] Can toggle theme
- [ ] Offline works (turn off WiFi/data)
- [ ] Responsive on iPhone SE, iPhone 14 Pro Max

---

## Troubleshooting

### PWA Won't Install?
1. Use Safari (not Chrome)
2. Make sure it's HTTPS
3. Check internet connection
4. Clear Safari cache: Settings > Safari > Clear History

### Blank Screen on Launch?
1. Force refresh: Two-finger tap > Reload
2. Or: Swipe down from top to refresh
3. Check console: DevTools > Console

### Not Loading Offline?
1. Check Service Worker: Settings > Developer > Service Workers
2. Or: Refresh once while online
3. Then go offline

### Can't Build in Xcode?
1. Update Xcode: App Store
2. Update CocoaPods: `sudo gem install cocoapods`
3. Run: `npx cap sync ios`
4. Rebuild

### iPhone Not Showing in Xcode?
1. Unlock iPhone
2. Trust computer (tap "Trust")
3. Restart Xcode
4. Restart iPhone

---

## Development Loop

### After Code Changes:

```bash
# 1. Build updated web app
npm run build

# 2. Copy to iOS app
npx cap sync ios

# 3. Rebuild in Xcode
# - Close app on iPhone
# - Press Play in Xcode
```

Or use watch mode:
```bash
# Terminal 1: Watch mode
npm run dev

# Terminal 2: Watch Capacitor
npx cap open ios
# Then in Xcode: Product > Run
```

---

## Deployment Timeline

**Web App:** 5 minutes ⚡
```
1. npm run build
2. npx vercel --prod
3. Share URL
```

**TestFlight:** 20 minutes ⏱️
```
1. Setup Xcode
2. Build & Archive
3. Upload to App Store Connect
4. Create TestFlight group
5. Invite testers
```

**App Store:** 3-5 hours (+ 1-3 days Apple review) 📅
```
1. Build & Archive
2. Upload to App Store Connect
3. Fill app details
4. Submit for review
5. Wait for approval
```

---

## Quick Start (Fastest Way)

```bash
# 1. Build
npm run build

# 2. Deploy (if not already done)
npm install -g vercel
vercel --prod

# 3. Share link with testers
# They visit URL on iPhone > Add to Home Screen

Done! 🎉
```

---

## Resources

- [Capacitor Docs](https://capacitorjs.com)
- [iOS Development](https://developer.apple.com/swift/)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [TestFlight Guide](https://developer.apple.com/testflight/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

## Next Steps

1. **Choose installation method** (recommend Option 1 for testing)
2. **Deploy web app** to Vercel
3. **Test on iPhone**
4. **Share feedback**
5. **(Optional) Build native iOS app**

Need help? Check troubleshooting section above!

---

**Last Updated:** April 2026  
**Status:** Ready to Deploy
