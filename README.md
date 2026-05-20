# promptForge

**promptForge** is an AI-powered SaaS platform that brings multiple AI capabilities together in one unified interface. Transform your creative process with cutting-edge AI technology for conversations, code generation, and music creation.

## Features

### AI Tools
- **AI Conversation** - Intelligent conversations powered by OpenAI's GPT-3.5-turbo
- **Code Generation** - Generate high-quality code snippets and solutions
- **Music Generation** - Create unique music from text descriptions using Replicate's Riffusion

### Platform Features
- **Free Tier** - 5 free AI generations for all users
- **Pro Subscription** - Unlimited AI generations for $20/month
- **In-App Payment** - Seamless Stripe payment processing without leaving the app
- **Usage Tracking** - Real-time usage statistics and limits
- **Account Management** - Manage subscription and billing through Stripe portal

### Technical Features
- Modern UI with Tailwind CSS and shadcn/ui components
- Smooth animations and transitions
- Fully responsive across all devices
- Secure authentication via Clerk (Email, Google, GitHub, LinkedIn)
- Form validation with react-hook-form and zod
- Retry logic with exponential backoff for API calls
- Graceful error handling with user-friendly messages
- PostgreSQL database with Prisma ORM
- Stripe Elements for secure payment processing

## Tech Stack

- **Framework:** Next.js 13 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI
- **Authentication:** Clerk
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Payment:** Stripe
- **AI APIs:** OpenAI, Replicate
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod
- **HTTP Client:** Axios

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Accounts for: Clerk, Supabase, Stripe, OpenAI, Replicate

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/promptForge.git
cd promptForge
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Create a `.env` file in the root directory with the following variables. See the setup instructions below for how to obtain each key.

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI API
OPENAI_API_KEY=

# Replicate API
REPLICATE_API_TOKEN=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
DATABASE_URL=

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe
STRIPE_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```



### Running the Application

1. **Development mode**
```bash
npm run dev
```

2. **Open your browser**
```
http://localhost:3000
```

3. **Test the payment flow**
Use Stripe test card:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)


## API Routes

- `POST /api/conversation` - AI conversation generation
- `POST /api/code` - Code generation
- `POST /api/music` - Music generation
- `POST /api/create-payment-intent` - Create Stripe payment intent
- `POST /api/create-subscription` - Create subscription after payment
- `GET /api/stripe` - Get Stripe checkout or portal session
- `POST /api/webhook` - Handle Stripe webhooks

## Database Schema

### UserApiLimit
Tracks free tier usage (5 generations limit)
- `id` - Unique identifier
- `userId` - Clerk user ID
- `count` - Number of generations used
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### UserSubscription
Manages Pro subscriptions
- `id` - Unique identifier
- `userId` - Clerk user ID
- `stripeCustomerId` - Stripe customer ID
- `stripeSubscriptionId` - Stripe subscription ID
- `stripePriceId` - Stripe price ID
- `stripeCurrentPeriodEnd` - Subscription period end date

## Error Handling

The app includes comprehensive error handling:
- Retry logic with exponential backoff for API failures
- Rate limit detection and handling (429 errors)
- Timeout enforcement (30s for conversations/code, 60s for music)
- User-friendly error messages for all failure scenarios
- Graceful degradation when services are unavailable

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/promptForge/issues)
- Documentation: Check the code comments and this README

