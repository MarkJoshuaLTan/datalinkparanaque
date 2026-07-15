# 🚀 DataLink Parañaque

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-11.9-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**DataLink Parañaque** is a professional-grade, offline-first web application designed for the City Government of Parañaque’s Real Property Data Division. It automates the cleaning, validation, and relational joining of complex land record spreadsheets, transforming raw data into audit-ready intelligence.

---

## ✨ Features

### 🏢 Core Features
*   **System Cleanup**: Removes noise rows (headers, totals, empty lines) automatically.
*   **Deduplication Engine**: Identifies duplicate PINs and prioritizes the highest/latest ARP number.
*   **Financial Calibration**: Auto-computes Market and Assessed values based on 2028/2029 projection rules.

### 🧠 AI Features
*   **Firebase Genkit Integration**: AI-driven flows for intelligent data processing and anomaly detection.

### 📊 Data Processing
*   **Three-Way Relational Joiner**: Intelligently links Assessment Rolls (reference), Journal Logs (transactions), and Sales Data (consideration).
*   **Smart Consideration**: Maps `SELLING PRICE` from Sales Data to the primary record while labeling secondary linked records with "REF" to prevent financial double-counting.
*   **TD Expansion**: Automatically detects and expands multi-property strings (e.g., `E-003-52121/22/23`) into individual records for processing.

### 📥 Import/Export
*   **Excel Parsing**: High-performance importing of `.xlsx` and `.csv` files.
*   **Advanced Exporting**: Export processed data directly to formatted Excel spreadsheets or professional PDF reports.

### 📈 Dashboard & Analytics
*   **Metric Overview**: Real-time analytical dashboard using Recharts for data visualization.
*   **Audit Logging**: Comprehensive logs for data flow tracking and transparency.
*   **Dark Mode**: Native support for light/dark themes via `next-themes`.

### ⚡ Performance Optimizations
*   **Client-Side Processing**: Zero server latency for massive spreadsheet processing.
*   **Batch Processing**: Smooth UI performance during heavy data reconciliation tasks.

---

## 📸 Screenshots

![Dashboard Placeholder](/placeholder-images.json)  
*(Screenshot of the main dashboard metrics and data preview table)*

![Three Year Report Placeholder](/placeholder-images.json)  
*(Screenshot of the relational joiner and export settings)*

---

## 🏗️ Architecture

*   **Frontend**: Built with Next.js 15 (App Router) and React 19 for a fast, component-driven architecture.
*   **Backend/Services**: Firebase is used for configuration, optional cloud integrations, and App Hosting.
*   **AI Integration**: Firebase Genkit orchestrates AI flows for advanced data parsing.
*   **File Processing Pipeline**: Fully client-side pipeline utilizing `xlsx` for parsing and a custom deterministic engine (`processor.ts`, `three-year-report-engine.ts`) for data manipulation.

---

## 🛠 Tech Stack

*   **Framework**: Next.js (15.1.11)
*   **Language**: TypeScript (5.9)
*   **UI Library**: React (19.0), Radix UI Primitives, shadcn/ui
*   **Styling**: Tailwind CSS (3.4), Tailwind Merge, Class Variance Authority
*   **Database/Cloud**: Firebase (11.9)
*   **AI Services**: Firebase Genkit
*   **Charts**: Recharts
*   **State & Form Management**: React Hook Form, Zod
*   **File Processing**: `xlsx`, `xlsx-js-style`, `jspdf`, `jspdf-autotable`
*   **Deployment**: Firebase App Hosting / Vercel

---

## 📂 Project Structure

```text
datalinkparanaque/
├── src/
│   ├── ai/                  # Firebase Genkit AI flows and configurations
│   ├── app/                 # Next.js 15 App Router pages and layouts
│   ├── components/
│   │   ├── dashboard/       # Core application components (Modals, Tables, Analytics)
│   │   └── ui/              # Reusable Shadcn UI primitives
│   ├── contexts/            # React context providers
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Core processing engines and utilities
│       ├── importer.ts      # Excel parsing logic
│       ├── processor.ts     # Data cleaning, deduplication, and calibration rules
│       └── three-year-report-engine.ts # Relational joining logic for property records
├── public/                  # Static assets and icons
├── components.json          # Shadcn UI configuration
├── apphosting.yaml          # Firebase App Hosting configuration
├── next.config.ts           # Next.js compiler and framework configuration
├── tailwind.config.ts       # Tailwind CSS theme and styling configuration
└── package.json             # Project dependencies and scripts
```

---

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/datalinkparanaque.git
cd datalinkparanaque
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory (see [Environment Variables](#-environment-variables)).

### 4. Run the development server
```bash
npm run dev
```
The application will be available at `http://localhost:9002`.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## ⚙ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket URL | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`| Firebase Messaging Sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Web App ID | Yes |
| `GENKIT_ENV` | Genkit environment configuration | No |

*(Note: Create a `.env.local` file with these values before running the application)*

---

## 📊 Workflow

1.  **Import Files** → Upload raw Assessment Rolls, Sales Data, or Journal Logs (Excel/CSV).
2.  **Validation** → Structural check for required columns and data types.
3.  **Processing** → Triggers `processor.ts` to execute System Cleanup and Deduplication.
4.  **Matching** → `three-year-report-engine.ts` executes a relational join across datasets.
5.  **Data Cleaning** → Fixes TD expansions and missing fields.
6.  **AI Processing** → *(Optional)* Triggers Genkit flows for anomaly detection.
7.  **Report Generation** → Financial calibration and summary aggregation.
8.  **Export** → Download audit-ready Excel sheets or PDF summaries.

---

## 📁 Supported File Types

*   **Import**: `.xlsx`, `.xls`, `.csv`
*   **Export**: 
    *   Formatted Excel (`.xlsx`) via `xlsx-js-style`
    *   Print-ready PDF (`.pdf`) via `jspdf`

---

## 🔄 Processing Pipeline

*   **`importer.ts`**: Standardizes incoming column headers and maps raw Excel rows to strictly typed `LandRecord` objects.
*   **`processor.ts`**: The core rules engine. Runs fuzzy matching on names (Jaro-Winkler), normalizes PINs, computes 2028/2029 tax values, and flags incomplete/duplicate records.
*   **`three-year-report-engine.ts`**: A specialized relational mapper. It expands grouped Tax Declarations, matches Assessment records to Sales/Journal data via normalized ARP numbers, and prepares grouped hierarchical rows for final export.

---

## 📈 Performance

*   **Client-Side Processing**: Eliminates server bottleneck by shifting heavy array processing to the browser using efficient JS engines.
*   **Batch Data Parsing**: Large Excel sheets are converted into manageable JSON blocks to prevent UI freezing.
*   **Virtualization**: Large data preview tables are optimized for rendering thousands of rows without lag.
*   **Memoization**: Extensive use of React's `useMemo` and `useCallback` to prevent unnecessary re-renders in the dashboard view.

---

## 🔒 Security

*   **Offline-First**: Sensitive land records never leave the browser during standard processing; all calculations are executed locally.
*   **File Sanitization**: Uploaded files are strictly parsed for specific data shapes, ignoring malicious macros or scripts.
*   **Type Safety**: End-to-end TypeScript and Zod validation prevents schema poisoning.

---

## 🧪 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the local Next.js development server on port 9002 |
| `npm run build` | Creates an optimized production build |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint to check for code quality and errors |
| `npm run typecheck` | Runs the TypeScript compiler to verify type correctness |

---

## 📅 Changelog

*   **v0.1.0** - Initial stable release.
    *   Implemented Next.js 15 App Router.
    *   Added custom Webpack/Turbopack handling.
    *   Integrated `three-year-report-engine` for relational dataset joining.
    *   Added PDF and formatted Excel export generation.
    *   Integrated Firebase Genkit AI flows.
    *   Migrated to React 19.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
