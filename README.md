# 📱 ATS Recruiter Mobile Application

Cross-platform iOS & Android mobile application for recruiters and hiring managers, built with **React Native + Expo SDK 57 (TypeScript)** and **TanStack React Query**.

---

## 🚀 Quick Start (100% Free Live Device Testing)

### 1. Start the Mobile Dev Server:
```bash
cd mobile
npx expo start
```

### 2. Run on Physical Phone (No paid developer account needed):
1. Download **Expo Go** from Google Play (Android) or Apple App Store (iOS).
2. Scan the terminal QR code with your phone camera or Expo Go app.
3. The app will load live on your phone with Hot Module Reloading!

---

## 🖥️ Running on Emulators:
- **Android Emulator**: `npm run android`
- **iOS Simulator** (macOS): `npm run ios`
- **Web Browser**: `npm run web`

---

## 🏗️ Generating Free Standalone Android APK:
You can build a production `.apk` locally on your machine for free without Google Play Store fees:
```bash
npx eas-cli build -p android --profile preview --local
```

---

## 📂 Architecture Overview:
- `src/api/`: Axios client with automated JWT access & refresh token rotation and platform-aware backend host resolution.
- `src/context/AuthContext.tsx`: Authenticated session management with hardware-encrypted `expo-secure-store`.
- `src/navigation/`: Bottom Tabs (`Dashboard`, `Positions`, `Candidates`, `Interviews`) and Native Stack Navigators.
- `src/screens/`:
  - `auth/LoginScreen`: Multi-tenant organization slug, email, and password login.
  - `dashboard/DashboardScreen`: Live KPI counters, upcoming interviews, and recent applications.
  - `jobs/JobsListScreen` & `JobPipelineScreen`: Searchable job postings and interactive Kanban stage columns.
  - `candidates/CandidatesListScreen` & `CandidateDetailScreen`: Search talent pool, view ATS match %, 1-tap WhatsApp/Call actions.
  - `interviews/InterviewsListScreen` & `SubmitFeedbackModal`: Scheduled interviews agenda, 1-tap Google Meet launcher, and 1-5 star scorecard submission.
