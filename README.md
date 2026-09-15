# Udua-Ket Dashboard

A modern, production-ready e-commerce management dashboard built with React, TypeScript, and Vite. Designed to manage product inventory, track stock levels.

---

## Features

- **Product Management**: Full CRUD workflow for managing inventory, pricing, reorder levels, and unit-of-measure (UOM) configurations.
- **Media Handling**: Support for multi-image uploads using `multipart/form-data` with client-side preview, validation, and retention logic.
- **Smart Data Fetching**: Powered by TanStack Query for caching, query invalidation, and automatic error handling.
- **Responsive UI**: Interactive interface styled with Tailwind CSS, Lucide Icons, and Framer Motion for smooth transitions.
- **Robust Validation**: Type-safe form handling paired with precise client-side error messaging.

---

## Tech Stack

- **Core**: React, TypeScript, Vite
- **State & Data Fetching**: TanStack Query (React Query) v5, Axios
- **Styling & Motion**: Tailwind CSS, Framer Motion, Lucide React
- **Routing**: React Router v6

---

## Getting Started

### Prerequisites

Ensure you have **Node.js 18+** and a package manager (`npm`, `pnpm`, or `yarn`) installed.

### Installation

1. **Clone the repository**

```bash
git clone [https://github.com/St80ene/uduakiet-dashboard.git](https://github.com/St80ene/uduakiet-dashboard.git)


cd uduakiet-dashboard
```

Install Dependencies

```bash

npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Start the Development Server

```bash
npm run dev
```

| Included          | Excluded                                            |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Starts local development server via Vite with HMR   |
| `npm run build`   | Runs TypeScript checks and builds production bundle |
| `npm run lint`    | Runs ESLint analysis across the codebase            |
| `npm run preview` | Previews the production build locally               |
