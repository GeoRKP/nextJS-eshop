# 🛍️ E-Shop Kapatsinas Eleutheros

A modern, full-featured e-commerce platform built with Next.js 15, offering a seamless shopping experience with beautiful UI, secure authentication, and integrated payment processing.

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-4.16.2-2D3748?style=for-the-badge&logo=prisma)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

## 📋 Table of Contents

- [✨ Features](#-features)
- [🖼️ Demo](#-demo)
- [🚀 Getting Started](#-getting-started)
- [🧪 Testing](#-testing)
- [🏗️ Project Structure](#-project-structure)
- [🛠️ Built With](#-built-with)
- [🚢 Deployment](#-deployment)
- [📝 License](#-license)
- [👥 Contributing](#-contributing)
- [🙏 Acknowledgements](#-acknowledgements)

## ✨ Features

### User Experience
- 🎨 Modern, responsive UI with Tailwind CSS and shadcn/ui components
- 📱 Mobile-first design approach
- 🌙 Dark/light mode support
- 🎯 Accessible and customizable UI components

### Core Functionality
- 🛒 Intuitive shopping cart functionality
- 🔍 Product search and filtering
- 💳 Secure PayPal payment integration
- 🔐 User authentication with NextAuth.js

### Technical Features
- 🔍 Type-safe development with TypeScript
- 🗄️ Prisma ORM with Neon PostgreSQL Database
- 🧪 Comprehensive Jest testing setup
- 🚀 Server-side rendering with Next.js App Router

## 🖼️ Demo

![E-Shop Demo](https://via.placeholder.com/800x400?text=E-Shop+Demo+Screenshot)

Visit the [live demo](https://eshop-kapatsinas-eleutheros.vercel.app) (placeholder link)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager
- A Neon Database account (for PostgreSQL)
- PayPal Developer account (for payments)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gkapatsinas/eshop-kapatsinas-eleutheros.git
   cd eshop-kapatsinas-eleutheros
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL="your-neon-database-url"

   # Authentication
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"

   # Payment
   PAYPAL_CLIENT_ID="your-paypal-client-id"
   PAYPAL_CLIENT_SECRET="your-paypal-client-secret"

   # Optional: Analytics
   NEXT_PUBLIC_ANALYTICS_ID="your-analytics-id"
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push

   # Optional: Seed the database with sample data
   npx prisma db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🧪 Testing

Run the test suite:
```bash
npm run test
# or
yarn test
```

For watch mode:
```bash
npm run test:watch
# or
yarn test:watch
```

For coverage report:
```bash
npm run test:coverage
# or
yarn test:coverage
```

## 🏗️ Project Structure

```
├── app/                 # Next.js app directory (App Router)
│   ├── (auth)/         # Authentication routes
│   ├── (root)/         # Main application routes
│   ├── api/            # API routes
│   └── layout.tsx      # Root layout
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── forms/          # Form components
│   └── shared/         # Shared components
├── lib/                 # Utility functions and configurations
│   ├── actions/        # Server actions
│   ├── constants/      # Constants and configuration
│   └── utils/          # Helper functions
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
├── tests/               # Test files
└── middleware.ts        # Next.js middleware
```

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - React framework for production
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built with Radix UI and Tailwind CSS
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [PayPal React SDK](https://www.npmjs.com/package/@paypal/react-paypal-js) - Payment processing
- [Jest](https://jestjs.io/) - JavaScript testing framework
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - Testing utilities

## 🚢 Deployment

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import your repository to Vercel
3. Configure environment variables
4. Deploy!

For other platforms, build the application:

```bash
npm run build
# or
yarn build
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgements

- [Vercel](https://vercel.com) for hosting
- [shadcn](https://twitter.com/shadcn) for the amazing UI components
- All open-source contributors whose libraries made this project possible

---

Made with ❤️ by George Kapatsinas | [GitHub](https://github.com/gkapatsinas) | [LinkedIn](https://linkedin.com/in/georgekapatsinas)
