# Wallet WebSocket App

A modern, real-time wallet application built with React and Node.js. This project demonstrates high-performance UI components, interactive 3D card animations, and real-time state synchronization using WebSockets.

## 🚀 Features

- **Authentication**: Sign in and sign up via Supabase — email/password with session persistence.
- **Real-time Balance Updates**: Instant synchronization of wallet balances across multiple sessions.
- **Interactive Wallet Card**: 3D tilt effects and subtle levitation animations on hover.
- **Transaction History**: Real-time updates for debit and credit transactions.
- **Secure Fund Transfers**: Functional transfer mechanism between masked PANs.
- **Premium Design System**: Sleek glassmorphism aesthetic with modern typography.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS 3, Redux Toolkit 2, React Router 7.
- **Auth**: Supabase (email/password, session management via `@supabase/supabase-js`).
- **Backend**: Node.js, Express 4, `ws` v8 (raw WebSocket).
- **Shared Types**: `/types` Nx package consumed by both frontend and backend.
- **Workspace**: Nx 22 monorepo — use **yarn** for all package operations.

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) project with email auth enabled

### Environment Variables

Create `frontend/.env.local`:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dimahoncharenko/wallet-websockets.git
   cd wallet-websocket-app
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

### Running the Application

You will need to run both the backend server and the frontend application simultaneously.

#### 1. Start the Backend Server
The server handles WebSocket connections and manages the wallet state.
```bash
yarn nx run server:serve
```
*Port: [http://localhost:3000](http://localhost:3000)*

#### 2. Start the Frontend
The frontend provides the interactive user interface.
```bash
yarn nx run frontend:serve
```
*Port: [http://localhost:3001](http://localhost:3001)*

## 🏗️ Production Build

To generate optimized production bundles:

```bash
yarn nx run server:build
yarn nx run frontend:build
```

The output will be available in the `dist/` directory.
