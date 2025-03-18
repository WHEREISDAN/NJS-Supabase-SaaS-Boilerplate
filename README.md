# Next.js 15 SaaS Boilerplate

A modern SaaS boilerplate built with Next.js 15, TypeScript, Tailwind CSS, DaisyUI, and Supabase.

## Features

- **Frontend**
  - Next.js 15 with App Router and Turbopack
  - React 19 with Server Components
  - TypeScript for type safety
  - Tailwind CSS v4 with DaisyUI for styling
  - Theme switching with dark/light mode support
  - Framer Motion for animations
  - Multiple font options (Geist, Geist Mono, Inter)
  - Responsive landing page components

- **Authentication & Database**
  - Supabase Authentication with middleware integration
  - Secure session management
  - Database access with Supabase client
  - Row-Level Security (RLS) policies for data protection
  - Automatic user profile creation on signup

- **Payment Processing**
  - Stripe integration for subscriptions and payments
  - Webhook support for payment events
  - Product synchronization script
  - Complete subscription lifecycle management
  - Customer portal integration

- **User Experience**
  - Toast notifications with Sonner
  - Loading states and animations
  - Responsive design for all device sizes

- **Developer Experience**
  - ESLint and Prettier for code quality
  - TypeScript throughout the codebase
  - Zod for form validation and type safety

## Getting Started

First, clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/njs-saas-bp.git
cd njs-saas-bp
npm install
```

Set up your environment variables:

```bash
cp .env.example .env.local
```

Edit the `.env.local` file with your Supabase and Stripe credentials.

Start the local Supabase instance:

```bash
npx supabase start
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── api/              # API routes for backend functionality
│   │   ├── profiles/     # User profile endpoints
│   │   ├── stripe/       # Stripe payment endpoints
│   │   └── webhooks/     # Webhook handlers
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard and protected pages
│   ├── pricing/          # Subscription pricing pages
│   └── layout.tsx        # Root layout with providers
├── components/           # React components
│   ├── auth/             # Authentication components
│   ├── landing/          # Landing page components
│   ├── theme/            # Theme-related components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   ├── api/              # API utilities
│   ├── stripe/           # Stripe integration
│   ├── supabase/         # Supabase client and utilities
│   └── subscription/     # Subscription management
├── types/                # TypeScript type definitions
└── middleware.ts         # Next.js middleware for auth
```

## Database Schema

The project uses Supabase as its database and authentication provider. Here's the database schema:

### Profiles Table
Stores user profile information and is automatically created when a user signs up.

| Column             | Type                    | Description                                |
|--------------------|-------------------------|--------------------------------------------|
| id                 | uuid (PK, FK to auth.users) | User's UUID from Supabase Auth            |
| updated_at         | timestamp with time zone | Last update timestamp                     |
| created_at         | timestamp with time zone | Creation timestamp                        |
| username           | text                    | User's username                            |
| full_name          | text                    | User's full name                           |
| avatar_url         | text                    | URL to user's avatar                       |
| website            | text                    | User's website                             |
| email              | text                    | User's email address                       |
| stripe_customer_id | text                    | Stripe customer ID for payments            |

### Subscriptions Table
Tracks user subscription status and details.

| Column                | Type                    | Description                               |
|-----------------------|-------------------------|-------------------------------------------|
| id                    | uuid (PK)              | Unique subscription ID                    |
| user_id               | uuid (FK to auth.users) | User's UUID                               |
| status                | text                    | Subscription status                       |
| price_id              | text                    | ID of the price plan                      |
| quantity              | integer                 | Number of subscription units              |
| cancel_at_period_end  | boolean                 | Whether to cancel at period end           |
| cancel_at             | timestamp with time zone | When subscription is scheduled to cancel  |
| canceled_at           | timestamp with time zone | When subscription was canceled            |
| current_period_start  | timestamp with time zone | Start of current billing period           |
| current_period_end    | timestamp with time zone | End of current billing period             |
| created_at            | timestamp with time zone | When subscription was created             |
| ended_at              | timestamp with time zone | When subscription ended                   |
| trial_start           | timestamp with time zone | Trial period start                        |
| trial_end             | timestamp with time zone | Trial period end                          |
| stripe_subscription_id| text                    | Stripe subscription ID                    |
| stripe_customer_id    | text                    | Stripe customer ID                        |

### Products Table
Stores product information synchronized from Stripe.

| Column      | Type                    | Description                               |
|-------------|-------------------------|-------------------------------------------|
| id          | text (PK)               | Product ID (from Stripe)                  |
| active      | boolean                 | Whether the product is active             |
| name        | text                    | Product name                              |
| description | text                    | Product description                       |
| image       | text                    | URL to product image                      |
| metadata    | jsonb                   | Additional product metadata               |
| created_at  | timestamp with time zone | Creation timestamp                        |

### Prices Table
Stores pricing information for products, synchronized from Stripe.

| Column            | Type                    | Description                               |
|-------------------|-------------------------|-------------------------------------------|
| id                | text (PK)               | Price ID (from Stripe)                    |
| product_id        | text (FK to products)   | Associated product ID                     |
| active            | boolean                 | Whether the price is active               |
| description       | text                    | Price description                         |
| unit_amount       | integer                 | Price amount in cents                     |
| currency          | text                    | Currency code (e.g., USD)                 |
| type              | text                    | Price type (one-time or recurring)        |
| interval          | text                    | Billing interval (month, year, etc.)      |
| interval_count    | integer                 | Number of intervals between billings      |
| trial_period_days | integer                 | Number of trial days                      |
| metadata          | jsonb                   | Additional price metadata                 |
| created_at        | timestamp with time zone | Creation timestamp                        |

## Row-Level Security

The database uses Row-Level Security (RLS) policies to protect data:

- Users can only view and update their own profiles
- Users can only view their own subscriptions
- Products and prices are viewable by everyone
- The service role can manage all subscriptions and profiles

## Available Scripts

- `npm run dev` - Run the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting with Prettier
- `npm run sync-stripe` - Synchronize Stripe products with your application

## Subscription System

The subscription system is built with the following components:

1. **Stripe Integration**
   - Products and prices synced from Stripe to Supabase
   - Webhook endpoint for real-time event handling
   - Client-side Stripe checkout integration

2. **Subscription Management**
   - Creation and tracking of subscriptions
   - Handling of subscription lifecycle events (create, update, cancel)
   - Automatic updates via webhooks

3. **User Interface**
   - Pricing page for subscription selection
   - Customer portal for managing active subscriptions
   - Dashboard with subscription status

4. **Access Control**
   - Route protection based on subscription status
   - Feature flagging for subscription tiers
   - Graceful handling of expired subscriptions

## Technologies

- [Next.js 15](https://nextjs.org/docs) - React framework with App Router
- [React 19](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/docs/) - Type-safe JavaScript
- [Tailwind CSS v4](https://tailwindcss.com/docs) - Utility-first CSS framework
- [DaisyUI](https://daisyui.com/) - Tailwind CSS component library
- [Supabase](https://supabase.io/docs) - Open source Firebase alternative
- [Stripe](https://stripe.com/docs) - Payment processing platform
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide React](https://lucide.dev/) - Icon library
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications
- [Zod](https://zod.dev/) - TypeScript-first schema validation

## Authentication Flow

This boilerplate uses Supabase Authentication with middleware integration to protect routes. The middleware checks for valid sessions and redirects unauthenticated users to the login page.

When a user signs up:
1. Supabase Auth creates a new user in the `auth.users` table
2. A database trigger automatically creates a profile in the `public.profiles` table
3. The middleware.ts file handles session management and route protection

## Learn More

To learn more about the technologies used in this project, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Supabase Documentation](https://supabase.com/docs) - Learn about Supabase services
- [Stripe Documentation](https://stripe.com/docs) - Learn about Stripe payments
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - Learn TypeScript
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn Tailwind CSS
- [DaisyUI Documentation](https://daisyui.com/docs/) - Learn DaisyUI components
