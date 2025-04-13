# 🛍️ E-Shop Kapatsinas Eleutheros

A modern e-commerce platform built with Next.js 15, featuring a beautiful UI, secure authentication, and seamless payment processing.

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🎨 Modern, responsive UI with Tailwind CSS and shadcn/ui components
- 🔐 Secure authentication with NextAuth.js
- 💳 PayPal payment integration
- 🛒 Shopping cart functionality
- 📱 Mobile-first design
- 🌙 Dark mode support
- 🧪 Jest testing setup
- 🗄️ Prisma ORM with Neon Database
- 🔍 Type-safe development with TypeScript
- 🎯 Accessible and customizable UI components with shadcn/ui

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager
- A Neon Database account (for PostgreSQL)
- PayPal Developer account (for payments)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/eshop-kapatsinas-eleutheros.git
   cd eshop-kapatsinas-eleutheros
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL="your-neon-database-url"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   PAYPAL_CLIENT_ID="your-paypal-client-id"
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

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

## 🏗️ Project Structure

```
├── app/                 # Next.js app directory
├── components/          # Reusable UI components
│   └── ui/             # shadcn/ui components
├── lib/                 # Utility functions and configurations
├── prisma/             # Database schema and migrations
├── public/             # Static assets
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
└── tests/              # Test files
```

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built with Radix UI and Tailwind CSS
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [PayPal React SDK](https://www.npmjs.com/package/@paypal/react-paypal-js) - Payment processing
- [Jest](https://jestjs.io/) - Testing framework

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ by George Kapatsinas
