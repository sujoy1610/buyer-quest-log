# 🏡 Lead Intake Pro

A **Buyer Lead Management System** built with **React, TypeScript, Supabase, Zod, TailwindCSS, and shadcn-ui**.  
This project was developed as part of an internship assignment to demonstrate skills in **frontend + backend integration, validation, authentication, and CRUD operations**.

---

## 🚀 Features

- 🔑 **Authentication** with Supabase (magic link or demo login)
- 📝 **Add new buyer leads** with full form validation (Zod + react-hook-form)
- 📋 **View all leads** in a responsive list with filtering and search
- ✏️ **Edit & update buyer details** (with history tracking)
- 🗑️ **Soft delete leads** (mark inactive without permanent removal)
- 📊 **Filter, search, and sort** buyers by city, budget, property type, etc.
- 📈 **Pagination** for large lead datasets
- 📥 **CSV import/export** for bulk data handling
- ⚡ **Form validation** with Zod (strong typing + instant feedback)
- 🎨 **Responsive UI** with Tailwind CSS + shadcn-ui

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite + TypeScript)
- **UI Framework:** Tailwind CSS + shadcn-ui
- **Database & Auth:** Supabase
- **Validation:** Zod + react-hook-form
- **State Management:** React Context API
- **Hosting/Scaffolding:** Lovable.dev

---

## 📂 Folder Structure

```bash
src/
├── components/
│   ├── BuyerForm.tsx        # Add/Edit buyer form
│   ├── BuyerList.tsx        # Table/list of buyers
│   ├── Layout.tsx           # App layout
│   ├── ProtectedRoute.tsx   # Auth-protected routes
│   └── ui/                  # UI components (shadcn-ui)
│
├── contexts/
│   └── AuthContext.tsx      # Supabase auth provider
│
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── integrations/
│   └── supabase/
│       ├── client.ts        # Supabase client setup
│       └── types.ts         # DB types
│
├── lib/
│   └── utils.ts             # Utility functions
│
├── pages/
│   ├── AuthPage.tsx
│   ├── BuyerDetailPage.tsx
│   ├── BuyersPage.tsx
│   ├── Index.tsx
│   ├── NewBuyerPage.tsx
│   └── NotFound.tsx
│
├── types/
│   └── buyer.ts             # Type definitions


Getting Started
1. Clone the Repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

2. Install Dependencies
npm install

3. Configure Environment Variables

Create a .env file in the project root:

VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

4. Start Development Server
npm run dev


The app will be available at http://localhost:5173

🔑 Authentication

Magic Link login (via Supabase)

Demo login option for quick access (if enabled)

📊 Database Schema (Supabase)
-- Buyers table
create table buyers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  city text,
  property_type text,
  bhk int,
  purpose text,
  budget_min int,
  budget_max int,
  timeline text,
  source text,
  status text,
  notes text,
  tags text[],
  owner_id uuid references auth.users(id),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Buyer history table
create table buyer_history (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references buyers(id) on delete cascade,
  changes jsonb,
  changed_at timestamp default now()
);

🧪 Testing

Run unit tests (e.g., budget validator) with:

npm test


npm run build

👩‍💻 Author

Sujoy Sarkar
Internship Assignment – Buyer Lead Management System
