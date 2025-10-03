# Momentum: Personal Finance Tracker

Momentum is a minimalist, visually-driven personal finance tracker designed to make managing money intuitive and beautiful. The application provides a central dashboard to visualize financial health at a glance. Key components include: a summary section for current balance, total income, and total expenses; an interactive chart displaying spending by category; a list of recent transactions; and a streamlined interface for adding new income or expense entries. The goal is to transform financial tracking from a chore into an empowering and aesthetically pleasing experience, helping users build positive financial momentum.

[cloudflarebutton]

## ✨ Key Features

- **Visual Dashboard:** Get a clear overview of your financial health on a single, beautifully designed page.
- **Financial Summaries:** Instantly see your current balance, total income, and total expenses.
- **Spending Insights:** An interactive pie chart visualizes your spending by category, helping you understand where your money goes.
- **Transaction History:** A clean, searchable list of your most recent transactions.
- **Effortless Entry:** Quickly add new income or expense transactions through a streamlined, intuitive form.
- **Responsive Design:** A flawless experience across all devices, from desktop to mobile.

## 🚀 Technology Stack

- **Frontend:**
  - [React](https://react.dev/)
  - [Vite](https://vitejs.dev/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/)
  - [Zustand](https://zustand-demo.pmnd.rs/) for state management
  - [Recharts](https://recharts.org/) for data visualization
  - [Framer Motion](https://www.framer.com/motion/) for animations
  - [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for form handling and validation
- **Backend:**
  - [Hono](https://hono.dev/) running on Cloudflare Workers
- **Storage:**
  - [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/) for state persistence
- **Language:**
  - [TypeScript](https://www.typescriptlang.org/)

## 🏁 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/) as the package manager and runtime

### Installation & Running Locally

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/momentum_finance_tracker.git
    cd momentum_finance_tracker
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Run the development server:**
    This command starts the Vite frontend development server and the Cloudflare Worker for the backend simultaneously.
    ```sh
    bun dev
    ```

The application will be available at `http://localhost:3000`.

## 🏗️ Project Structure

The project is organized as a monorepo-like structure within a single repository:

-   `src/`: Contains the frontend React application built with Vite.
    -   `pages/`: Main pages of the application.
    -   `components/`: Reusable React components, including shadcn/ui components.
    -   `stores/`: Zustand state management stores.
    -   `lib/`: Utility functions and API client.
-   `worker/`: Contains the Hono backend application that runs on Cloudflare Workers.
    -   `user-routes.ts`: Defines the API endpoints.
    -   `entities.ts`: Defines the data models and interaction logic with Durable Objects.
-   `shared/`: Contains TypeScript types and mock data shared between the frontend and backend.

## 🛠️ Development

-   **Frontend:** All frontend code resides in the `src` directory. Changes will trigger hot-reloading via Vite.
-   **Backend:** The Hono API is located in the `worker` directory. Routes are defined in `worker/user-routes.ts`. The local development server will automatically reload on changes.
-   **State Management:** Application state is persisted in a single Cloudflare Durable Object, which is abstracted away by `Entity` classes in `worker/entities.ts`.

## ☁️ Deployment

This project is designed for seamless deployment to the Cloudflare network.

1.  **Login to Cloudflare:**
    Ensure you have the Wrangler CLI installed and are logged into your Cloudflare account.
    ```sh
    bunx wrangler login
    ```

2.  **Deploy the application:**
    Run the deploy script, which builds the application and deploys it to your Cloudflare account.
    ```sh
    bun run deploy
    ```

Alternatively, you can deploy directly from your GitHub repository with a single click.

[cloudflarebutton]