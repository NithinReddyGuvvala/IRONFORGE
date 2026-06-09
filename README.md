# 🏋️‍♂️ IRONFORGE — Premium Fitness Studio

> **Transform Your Body, Transform Your Life.** A state-of-the-art strength, conditioning, and transformation gym application built with high-end, responsive aesthetics, dark modes, and dynamic interactive elements.

![Iron Forge Gym Banner](./src/assets/hero-gym.jpg)

---

## ✨ Key Features

*   **🔒 Secure Authentication**: Multi-provider logins (Google OAuth and Email/Password credentials) with customized inline diagnostics inside the login box.
*   **📋 Interactive Bookings & Subscriptions**: Explore modern programs, pricing grids with annual/monthly billing switches, and sign up for classes.
*   **💬 Real-Time Client Reviews**: Fully integrated review slider allowing authenticated gym members to post, modify, or read reviews locally.
*   **🛠️ Powerful Administration Panel**: Core dashboard for gym owners to manage members, active packages, training categories, and support contacts.
*   **📈 Dynamic BMI Calculator**: Client-side widget helping prospective members calculate their body mass index and plan their fitness targets.

---

## 🎨 Visual Showcase & Design System

The platform features a **premium dark gym aesthetic** tailored around HSL-curated crimson glows, glassmorphism, custom micro-animations, and clean Oswald/Inter display typography.

### 🏋️ Programs & Training Packages
Explore specialized fitness routes led by elite coaches:
![Gym Programs](./src/assets/program-weights.jpg)

### 🧘 Dedicated Fitness Areas
Equipped with modern infrastructure and state-of-the-art equipment:
![Gym Interior](./src/assets/gym-interior.jpg)

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Core Client** | **React 19 & TypeScript** | Component rendering and strict type safety |
| **Routing** | **TanStack Router & Start** | High-performance client-side routing |
| **Styling** | **Tailwind CSS v4** | Modern utility-first CSS layout engine |
| **Backend / DB** | **Firebase Auth & Firestore** | Cloud security rules, user stores, and real-time database |
| **Bundling** | **Vite** | Hyper-fast development server and asset compiler |

---

## 🚀 Local Installation & Setup

Follow these steps to run the application locally on your computer:

### 1. Clone the Repository
```bash
git clone https://github.com/NithinReddyGuvvala/IRONFORGE.git
cd IRONFORGE
```

### 2. Install Project Dependencies
Use `npm` to install all required libraries:
```bash
npm install
```

### 3. Setup Environment Configuration
Create a `.env` file at the project root based on the template in `.env.example`:
```bash
cp .env.example .env
```
Fill in your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

### 4. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:8080/`** (or the port shown in terminal) in your browser to view the app!

---

## 🌐 Production Deployment

Deploy the site to **Firebase Hosting** in a single command:
```bash
# Build client files
npm run build

# Deploy to Hosting
npx firebase deploy --only hosting
```
