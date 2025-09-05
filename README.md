# Recipes Next.js

A modernized recipe and cookbook management platform built with Next.js 15, React, and TypeScript. This is the frontend companion to the Laravel Recipes 2025 backend API.

## ✨ Features

### Core Functionality
- 🗂️ **Recipe Management** - Create, edit, organize, and search recipes with advanced filtering
- 📚 **Cookbook Creation** - Compile recipes into custom cookbooks with ordering
- 🔍 **Advanced Search** - Search recipes by name, ingredients, and tags
- 📱 **Mobile-First Design** - Responsive design optimized for all devices
- 🔐 **Privacy Controls** - Public/private recipes and cookbooks (Tier 2+ users)
- 🏷️ **Smart Categorization** - Organize by classification, meal type, course, and preparation method

### Technical Features
- 🔒 **Secure Authentication** - JWT token-based authentication with Laravel backend
- 🎨 **Modern UI** - Built with Tailwind CSS and custom components
- 🚀 **Next.js 15** - Latest Next.js with App Router and React Server Components
- 📊 **TypeScript** - Full type safety throughout the application
- 🔄 **API Integration** - Seamless integration with Laravel Recipes 2025 backend

## 🚀 Quick Start

### Prerequisites
- **Node.js 20.x** or later
- **npm 10.x** or later
- **Laravel Recipes 2025 Backend** running on http://localhost:8000

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx               # Home page
│   ├── recipes/               # Recipe-related pages
│   │   ├── page.tsx          # Recipes list
│   │   ├── create/           # Create recipe
│   │   └── [id]/             # Recipe details
│   └── cookbooks/            # Cookbook-related pages
├── components/               # Reusable React components
│   ├── ui/                  # Basic UI components
│   ├── recipe/              # Recipe-specific components
│   └── cookbook/            # Cookbook-specific components
├── lib/                     # Utilities and API client
│   ├── api.ts              # API client for backend integration
│   └── utils.ts            # Utility functions
└── types/                   # TypeScript type definitions
    └── index.ts            # All application types
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React hooks and context
- **HTTP Client**: Fetch API with custom wrapper

### Development Tools
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript
- **Package Manager**: npm

## 🔗 API Integration

This frontend integrates with the Laravel Recipes 2025 backend API. Key API endpoints include:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/user` - Get current user

### Recipes
- `GET /recipes` - List user's recipes
- `GET /recipes/public` - List public recipes
- `POST /recipes` - Create recipe
- `GET /recipes/{id}` - Get recipe details
- `PUT /recipes/{id}` - Update recipe
- `DELETE /recipes/{id}` - Delete recipe

### Cookbooks
- `GET /cookbooks` - List user's cookbooks
- `GET /cookbooks/public` - List public cookbooks
- `POST /cookbooks` - Create cookbook
- `GET /cookbooks/{id}` - Get cookbook details

## 🎨 Component Library

### UI Components
- **Button** - Customizable button with variants and sizes
- **Input** - Form input with label and error handling
- **Textarea** - Multi-line text input
- **Card** - Content container with header, content, and footer

### Recipe Components
- **RecipeCard** - Display recipe in card format
- **RecipeForm** - Create/edit recipe form

### Cookbook Components
- **CookbookCard** - Display cookbook in card format
- **CookbookForm** - Create/edit cookbook form

## 🚦 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Linting with auto-fix
npm run lint:fix
```

## 📱 Features by Page

### Home Page (`/`)
- Hero section with search
- Featured recipes and cookbooks
- Call-to-action sections
- Public content showcase

### Recipes Page (`/recipes`)
- Toggle between public and user recipes
- Search and filter functionality
- Grid layout with recipe cards
- Create new recipe button (authenticated users)

### Recipe Details (`/recipes/[id]`)
- Full recipe information
- Ingredients and instructions
- Nutritional information
- Privacy and action controls

### Cookbooks Page (`/cookbooks`)
- Toggle between public and user cookbooks
- Search functionality
- Grid layout with cookbook cards
- Create new cookbook button (authenticated users)

## 🔐 Authentication Flow

1. Users can browse public content without authentication
2. Registration/login required for creating content
3. JWT tokens stored in localStorage
4. Automatic token attachment to authenticated requests
5. Privacy controls for Tier 2+ users

## 🎯 Subscription Tiers

### Free Tier
- View public recipes and cookbooks
- Create up to 25 public recipes
- Create 1 public cookbook
- Basic search functionality

### Tier 1 ($9.99/month)
- Unlimited public recipes
- Up to 10 cookbooks
- Advanced search
- PDF export functionality

### Tier 2 ($19.99/month)
- All Tier 1 features
- Privacy controls (private recipes/cookbooks)
- Unlimited cookbooks
- Advanced features

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   - Import your repository to Vercel
   - Configure environment variables

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com/api/v1
   ```

3. **Deploy**
   - Automatic deployments on git push
   - Preview deployments for pull requests

### Manual Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Implement responsive designs with Tailwind CSS
4. Test with the Laravel backend API
5. Ensure accessibility standards are met

## 📄 License

This project is open-sourced software licensed under the [MIT license](LICENSE).

## 🔗 Related Projects

- [Laravel Recipes 2025](../laravel-recipes-2025) - Backend API server
- Built to complement the Laravel backend with the same feature set

---

⭐ **Star this repository if you find it helpful!**

🐛 **Found a bug?** [Open an issue](https://github.com/your-repo/issues)

💡 **Have a feature request?** [Start a discussion](https://github.com/your-repo/discussions)
