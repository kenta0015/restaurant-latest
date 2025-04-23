🍽️ Restaurant Inventory App

A mobile-first inventory management app built for small kitchens, food trucks, and prep-focused operations. Designed to simplify stock tracking by focusing on what matters: prep, not sales.

🎯 Project Objective

Build a mobile-first inventory management app tailored for small restaurants, food trucks, and prep-heavy kitchens. The app focuses on tracking inventory based on prep quantity, not sales or POS data.

✅ Features

🧾 Track Ingredients: Add, view, and update ingredient inventory

🍱 Log Meals Prepped: Automatically deduct stock based on prep

🔁 Smart Suggestions: Prep estimates based on day-of-week usage trends

✍️ Manual Adjustments: Override prep suggestions as needed

⚠️ Low Stock Alerts: Non-blocking reminders to restock

⏰ Expiry Tracking: Get alerts for ingredients nearing expiration

📋 Prep Sheet Interface: Shows required amounts per ingredient per day, allows toggling "completed" state and quantity edits, then updates inventory with one tap

🛠 Built With

React Native (Expo) – cross-platform mobile development

Supabase – real-time database and authentication

Zustand – state management

React Hook Form – flexible form handling

React Native Paper – UI components

Jest – testing framework

🔑 Core Features

Prep-Based Stock Deduction: Ingredients are subtracted when meals are prepped, not served.

Smart Prep Suggestions: Uses weekday-based moving averages to suggest prep amounts.

Manual Override: Staff can adjust or overwrite suggestions.

Low Stock Alerts: Warns when stock drops below a safe level.

Expiry Tracking: Flags ingredients nearing expiration.

Prep Sheet UI: Visual prep list with daily requirements, manual toggles, and live inventory updates.

🚀 Getting Started

Clone this repo

Install dependencies:

npm install

Start the app:

