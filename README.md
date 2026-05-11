# promptForge

**promptForge** is an AI-powered SaaS platform that brings multiple AI capabilities together in one unified interface. Transform your creative process with cutting-edge AI technology for conversations, code generation, and music creation.

## What It Does

promptForge offers three core AI-powered features:

- **AI Conversation** - Engage in intelligent conversations powered by OpenAI's GPT-3.5-turbo for creative brainstorming, problem-solving, and general inquiries
- **Code Generation** - Generate high-quality code snippets and solutions using advanced AI models to accelerate your development workflow
- **Music Generation** - Create unique music compositions from text descriptions using Replicate's Riffusion AI model

## Features

- Modern UI with Tailwind CSS design system
- Smooth animations and transitions
- Fully responsive across all devices
- Secure authentication via Clerk (Email, Google, Github, LinkedIn)
- Form validation and handling with react-hook-form
- Real-time AI generation tools
- Loading states and user feedback

```shell
git clone 
```

### Install packages

```shell
npm i
```

### Setup .env file


```js
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

OPENAI_API_KEY=
REPLICATE_API_TOKEN=

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
