# Basic Auth Template

A full-stack authentication template built with modern web technologies. This monorepo includes a React client with TanStack Router and a Bun server with Prisma.

## 🚀 Features

### Authentication
- **Complete Auth Flow**: Sign up, login, logout, forgot password, reset password
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Route-level protection with automatic redirects
- **Session Management**: Automatic logout on token expiration (401 responses)

### Frontend (Client)
- **React 19** with TypeScript
- **TanStack Router** for client-side routing with type safety
- **TanStack Query** for server state management
- **Tailwind CSS v4** for styling
- **shadcn/ui Components** for UI components
- **Lucide React** for icons
- **React Hook Form + Zod** for form handling and validation
- **Axios** for HTTP requests with interceptors
- **Theme Support** with next-themes

### Backend (Server)
- **Bun Runtime** for fast JavaScript execution
- **Prisma ORM** for database management
- **JWT Authentication** for secure token handling
- **Email Templates** with React Email
- **Input Validation** with Zod schemas
- **RESTful API** design

### Developer Experience
- **Monorepo Structure** with workspaces
- **TypeScript** throughout the stack
- **ESLint** for code linting
- **Concurrent Development** servers
- **Hot Module Replacement** for fast development

## 📁 Project Structure

```
├── apps/
│   ├── client/          # React frontend application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── routes/      # Page components and routing
│   │   │   ├── services/    # API service layer
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Utility functions and configs
│   │   │   └── types/       # TypeScript type definitions
│   │   └── package.json
│   └── server/          # Bun backend application
│       ├── src/
│       │   ├── controllers/ # Request handlers
│       │   ├── routes/      # API route definitions
│       │   ├── schemas/     # Zod validation schemas
│       │   ├── emails/      # Email templates
│       │   └── lib/         # Server utilities
│       ├── prisma/          # Database schema and migrations
│       └── package.json
└── package.json         # Root package.json with workspace config
```

## 🛠️ Quick Start

### Prerequisites
- [Bun](https://bun.com) (v1.2.19 or later)
- Node.js (for compatibility)
- Database (PostgreSQL, MySQL, or SQLite)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd basic-auth-template
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment files
   cp apps/server/.env.example apps/server/.env
   cp apps/client/.env.example apps/client/.env
   ```

4. **Configure database**
   ```bash
   cd apps/server
   # Edit .env with your database URL
   # Run database migrations
   bunx prisma migrate dev
   ```

### Development

**Start both client and server concurrently:**
```bash
bun run dev
```

**Or run them separately:**
```bash
# Terminal 1 - Frontend (port 5173)
bun run dev:web

# Terminal 2 - Backend (port 3000)
bun run dev:server
```

## 🔧 Configuration

### Environment Variables

#### Client (`apps/client/.env`)
```env
VITE_API_URL=http://localhost:3000/api
```

#### Server (`apps/server/.env`)
```env
DATABASE_URL="your-database-url"
JWT_SECRET="your-secret-key"
EMAIL_FROM="your-email@domain.com"
# Add other email service configuration
```

### Database Setup

The project uses Prisma for database management. The schema includes:
- **Users** table with email, password, name
- **Password reset tokens** for secure password recovery

Run migrations:
```bash
cd apps/server
bunx prisma migrate dev
bunx prisma generate
```

## 📝 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /signup` - Create new user account
- `POST /login` - Authenticate user
- `POST /logout` - Invalidate user session
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

## 🎨 UI Components

The project includes a comprehensive set of UI components built with Radix UI and styled with Tailwind CSS:

- **Forms**: Input, Label, Select, Checkbox
- **Navigation**: Sidebar, Dropdown Menu, Breadcrumb
- **Feedback**: Toast notifications, Badges
- **Layout**: Cards, Separators, Sheets
- **Data Display**: Tables, Charts, Avatars

## 🔐 Authentication Flow

1. **Registration**: Users sign up with email, password, and name
2. **Login**: JWT token issued and stored in localStorage
3. **Route Protection**: `beforeLoad` checks for valid tokens
4. **Auto Logout**: 401 responses trigger automatic logout
5. **Password Recovery**: Email-based password reset flow

## 🧪 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use kebab-case for file names
- Implement error handling with try/catch

### State Management
- Use TanStack Query for server state
- Use React state for UI state
- Store authentication data in localStorage

### Routing
- Protected routes under `/_app` layout
- Authentication routes under `/_auth` layout
- Use TanStack Router's type-safe navigation

## 📦 Scripts

### Root Level
- `bun run dev` - Start both client and server
- `bun run dev:web` - Start client only
- `bun run dev:server` - Start server only

### Client (`apps/client`)
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run lint` - Run ESLint
- `bun run preview` - Preview production build

### Server (`apps/server`)
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bunx prisma studio` - Open Prisma Studio
- `bunx prisma migrate dev` - Run database migrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Write tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Resources

- [Bun Documentation](https://bun.com/docs)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
