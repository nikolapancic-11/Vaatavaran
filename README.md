<p align="center">
  <img src="https://alletec.com/wp-content/uploads/2023/03/alletec-logo.png" alt="Alletec Logo" width="200"/>
</p>

<h1 align="center">🌿 Vaatavaran</h1>

<p align="center">
  <strong>Sustainability Emissions Tracking App for Microsoft Business Central</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#setup-guides">Setup Guides</a> •
  <a href="#local-development">Local Development</a>
</p>

---

## About

**Vaatavaran** (Hindi: वातावरण, meaning "Environment") is a React Native mobile application designed for office staff and finance teams to track carbon emissions. Users can upload utility bills, extract data using Azure AI Document Intelligence, and submit sustainability journal entries to Microsoft Business Central.

## Features

- **AI-Powered Bill Extraction** — Upload electricity, fuel, and utility bills. Azure Document Intelligence extracts bill date, vendor name, and consumption amounts automatically.
- **Business Central Integration** — Submit sustainability journal entries directly to Microsoft BC using the Sustainability module and custom APIs.
- **Scope-Based Tracking** — Organize emissions by Scope 1 (Direct), Scope 2 (Electricity/Heat), and Scope 3 (Indirect/Value Chain).
- **SharePoint Document Storage** — Uploaded bills are stored in a structured SharePoint site organized by Year/Category/Subcategory/Account.
- **Draft & Offline Support** — Save entries as drafts locally and submit when ready.
- **Dashboard & Analytics** — View total entries, monthly summaries, and emission totals at a glance.
- **History & Filtering** — Search and filter past entries by date range, scope, category, calculation type, and status.
- **Push Notifications** — Firebase Cloud Messaging for submission confirmations and reminders.
- **Demo Login** — Pre-configured demo credentials for quick access and testing.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile Framework** | React Native 0.80+ with TypeScript |
| **Navigation** | React Navigation 7 (Bottom Tabs + Native Stack) |
| **HTTP Client** | Axios |
| **Local Storage** | @react-native-async-storage/async-storage |
| **File Upload** | react-native-blob-util |
| **File Picker** | @react-native-documents/picker |
| **Date Picker** | @react-native-community/datetimepicker |
| **Icons** | react-native-vector-icons (MaterialCommunityIcons) |
| **Push Notifications** | @react-native-firebase/messaging |
| **AI Document Extraction** | Azure AI Document Intelligence |
| **ERP Backend** | Microsoft Dynamics 365 Business Central |
| **Document Storage** | SharePoint Online (Microsoft Graph API) |
| **Authentication** | OAuth 2.0 Client Credentials (Entra ID) |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Native App                   │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │Dashboard │ │  Upload  │ │  Manual  │ │History │ │
│  │ Screen   │ │  Screen  │ │  Entry   │ │Screen  │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ │
│       │             │            │            │      │
│  ┌────┴─────────────┴────────────┴────────────┴────┐ │
│  │           Centralized API Service Layer          │ │
│  │  ┌─────────────┐ ┌────────────┐ ┌────────────┐  │ │
│  │  │  BC OAuth   │ │ Graph API  │ │  ADI Client │  │ │
│  │  │  Client     │ │ Client     │ │             │  │ │
│  │  └──────┬──────┘ └─────┬──────┘ └──────┬──────┘  │ │
│  └─────────┼──────────────┼───────────────┼─────────┘ │
└────────────┼──────────────┼───────────────┼───────────┘
             │              │               │
     ┌───────▼──────┐ ┌────▼─────┐ ┌───────▼──────────┐
     │  Business    │ │SharePoint│ │ Azure Document    │
     │  Central     │ │ Online   │ │ Intelligence      │
     │  REST API    │ │Graph API │ │ REST API          │
     └──────────────┘ └──────────┘ └───────────────────┘
```

### Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── FormField.tsx
│   ├── ModalPicker.tsx
│   ├── LoadingOverlay.tsx
│   ├── StatCard.tsx
│   ├── EmptyState.tsx
│   ├── SectionHeader.tsx
│   └── ActionButton.tsx
├── config/
│   ├── appConfig.ts     # Real config values (gitignored)
│   └── appConfig.example.ts  # Placeholder template
├── navigation/
│   └── AppNavigator.tsx # Bottom tabs + stack navigators
├── screens/
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── ScopeDetailScreen.tsx
│   ├── ManualEntryScreen.tsx
│   ├── UploadScreen.tsx
│   ├── HistoryScreen.tsx
│   └── SettingsScreen.tsx
├── services/
│   └── api.ts           # Centralized API service layer
├── types/
│   └── index.ts         # All TypeScript interfaces
└── theme/
    └── index.ts         # Colors, spacing, typography
```

---

## Setup Guides

### 1. Business Central Setup

#### Enable the Sustainability Module

1. Open **Business Central** and navigate to the **Sustainability Manager** role center.
2. Go to **Sustainability Setup** and enable the module.
3. Configure **Emission Scopes** (Scope 1, 2, 3).
4. Set up **Sustainability Categories** (e.g., Fuel, Electricity, Transport).
5. Create **Subcategories** and **Accounts** under each category.
6. Configure **ESG Locations** for your office/facility locations.

#### Required Custom APIs to Publish

Publish the following custom API pages in Business Central:

| API Page | Endpoint | Purpose |
|----------|----------|---------|
| Sustainability Journal Entries | `api/alletec/vaatavaran/v1.0/companies({companyId})/sustainabilityJournalEntries` | Submit new emission entries |
| Sustainability Categories | `api/microsoft/sustainability/v1.0/companies({companyId})/sustainabilityCategories` | List emission categories |
| Sustainability Subcategories | `api/microsoft/sustainability/v1.0/companies({companyId})/sustainabilitySubcategories` | List subcategories |
| Sustainability Accounts | `api/microsoft/sustainability/v1.0/companies({companyId})/sustainabilityAccounts` | List accounts |
| ESG Locations | `api/alletec/vaatavaran/v1.0/companies({companyId})/esgLocations` | List facility locations |
| Vendors | `api/v2.0/companies({companyId})/vendors` | List vendors |

#### Register an Entra ID (Azure AD) App

1. Go to [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **App registrations** → **New registration**.
2. Name: `Vaatavaran BC Integration`.
3. Supported account types: **Single tenant**.
4. Register the app and note the **Application (client) ID** and **Directory (tenant) ID**.
5. Go to **Certificates & secrets** → **New client secret** → copy the secret value.
6. Go to **API permissions** → **Add a permission**:
   - Select **Dynamics 365 Business Central**
   - Choose **Application permissions**
   - Add `API.ReadWrite.All` and `Automation.ReadWrite.All`
7. Click **Grant admin consent** for the tenant.

#### Configure API Endpoints

The app uses this base URL pattern:
```
https://api.businesscentral.dynamics.com/v2.0/{tenantId}/{environment}/
```

Replace `{tenantId}` with your Entra ID Tenant ID and `{environment}` with your BC environment name (e.g., `EdTech_Demo_V2`).

---

### 2. Azure Document Intelligence Setup

#### Create an ADI Resource

1. Go to [Azure Portal](https://portal.azure.com) → **Create a resource** → search **Document Intelligence**.
2. Select **Document Intelligence** → **Create**.
3. Choose your subscription, resource group, region, and pricing tier (S0 for production).
4. After deployment, go to **Keys and Endpoint** and copy:
   - **Endpoint URL** (e.g., `https://your-resource.cognitiveservices.azure.com`)
   - **API Key** (Key 1 or Key 2)

#### Train a Custom Extraction Model

1. Go to [Document Intelligence Studio](https://documentintelligence.ai.azure.com/studio).
2. Create a **Custom extraction model** project.
3. Upload 5-10 sample utility bills (electricity, fuel, water).
4. Label the following fields in each document:

| Field Name | Description | Example |
|-----------|-------------|---------|
| `billDate` | Date on the bill | 2024-03-15 |
| `vendorName` | Utility provider name | City Power Corp |
| `amount` | Total consumption/amount | 1250.5 |
| `unit` | Unit of measurement | kWh |
| `billNumber` | Invoice/bill number | INV-2024-001 |
| `totalCost` | Total bill amount | $125.50 |

5. Train the model and note the **Model ID** (e.g., `sustainability-electricitybills`).
6. Test the model with new documents to verify accuracy.

---

### 3. SharePoint Setup

#### Create a SharePoint Site

1. Go to [SharePoint Admin Center](https://admin.microsoft.com/sharepoint).
2. Create a new **Team site** named `Sustainability-DEV`.
3. Create the following folder structure in the **Documents** library:

```
Documents/
├── 2024/
│   ├── Electricity/
│   │   ├── Grid/
│   │   └── Renewable/
│   ├── Fuel/
│   │   ├── Natural Gas/
│   │   └── Diesel/
│   └── Transport/
│       ├── Fleet/
│       └── Business Travel/
├── 2025/
│   └── (same structure)
└── 2026/
    └── (same structure)
```

#### Entra ID App Permissions for Graph API

Using the **same** Entra ID app registered for BC:

1. Go to **API permissions** → **Add a permission** → **Microsoft Graph**.
2. Select **Application permissions**.
3. Add: `Sites.ReadWrite.All`, `Files.ReadWrite.All`.
4. Click **Grant admin consent**.

The app uses the site reference: `alletec.sharepoint.com:/sites/Sustainability-DEV`

---

### 4. Firebase Setup

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com) → **Add project**.
2. Name it `Vaatavaran` and follow the setup wizard.
3. Add your Android app:
   - Package name: `com.vaatavaran`
   - Download `google-services.json` and place it in `android/app/`.
4. Add your iOS app:
   - Bundle ID: `com.vaatavaran`
   - Download `GoogleService-Info.plist` and add it to the Xcode project.

#### Enable Cloud Messaging

1. In Firebase Console → **Cloud Messaging** → note the **Server Key**.
2. For Android, ensure `google-services.json` is in place.
3. For iOS:
   - Upload your APNs authentication key in Firebase Console.
   - Enable **Push Notifications** capability in Xcode.

---

## Local Development

### Prerequisites

- **Node.js** 18+ and npm
- **React Native CLI**: `npm install -g @react-native-community/cli`
- **Xcode** 15+ (macOS only, for iOS builds)
- **Android Studio** with Android SDK 34+
- **CocoaPods** (macOS): `gem install cocoapods`
- **JDK 17** for Android builds

### Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/nikolapancic-11/Vaatavaran.git
cd Vaatavaran

# 2. Install dependencies
npm install

# 3. Copy config template and fill in your values
cp src/config/appConfig.example.ts src/config/appConfig.ts
# Edit src/config/appConfig.ts with your Entra ID, BC, ADI values

# 4. iOS setup (macOS only)
cd ios && pod install && cd ..

# 5. Run the app
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

### Configuration

Copy `src/config/appConfig.example.ts` to `src/config/appConfig.ts` and fill in:

```typescript
export const appConfig = {
  // Entra ID (Azure AD)
  entraClientId: 'YOUR_CLIENT_ID',
  entraTenantId: 'YOUR_TENANT_ID',
  entraClientSecret: 'YOUR_CLIENT_SECRET',

  // Business Central
  bcEnvironment: 'YOUR_BC_ENVIRONMENT',
  bcCompanyId: 'YOUR_COMPANY_ID',
  // ... see appConfig.example.ts for all fields
};
```

> **Important:** `appConfig.ts` is gitignored and should never be committed. It contains secrets.

---

## Screenshots

> _Screenshots will be added after the app is fully built._

| Login | Dashboard | Manual Entry |
|-------|-----------|-------------|
| _Coming soon_ | _Coming soon_ | _Coming soon_ |

| Upload & Extract | History | Settings |
|-----------------|---------|----------|
| _Coming soon_ | _Coming soon_ | _Coming soon_ |

---

## License

This project is proprietary software developed by [Alletec](https://alletec.com).

---

<p align="center">
  Built with ❤️ by <a href="https://alletec.com">Alletec</a>
</p>
