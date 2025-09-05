# Recipes Next.js - Full-Stack Recipe Management App

This is a complete migration of the Laravel Recipes 2025 project to Next.js, providing both frontend and backend functionality in a single application.

## 🚀 Features

- **Full-Stack Next.js** - Both frontend and API routes in one application
- **Database** - MariaDB with Prisma ORM
- **Recipe Management** - CRUD operations for recipes with rich metadata
- **Cookbook Management** - Create, organize, and share recipe collections  
- **Advanced Search** - Multi-field search across recipes
- **User Management** - Basic user management (auth integration planned)
- **Admin Dashboard** - Statistics and bulk operations
- **Responsive Design** - Mobile-friendly interface

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: MariaDB with Prisma ORM
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## 📋 Prerequisites

- Node.js 18+ 
- MariaDB or MySQL database
- npm or yarn

## ⚡ Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd recipes-next-js
   npm install
   ```

2. **Database Setup**
   ```bash
   # Copy environment file
   cp .env.example .env.local
   
   # Update DATABASE_URL in .env.local
   # Example: DATABASE_URL="mysql://user:password@localhost:3306/recipes"
   ```

3. **Database Migration**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Optional: Seed with sample data
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Test API Endpoints** (Optional)
   ```bash
   # Test that all API routes are working
   node scripts/test-api.js
   ```

Visit `http://localhost:3000` to access the application.

## 🗂️ Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── recipes/           # Recipe CRUD & search
│   │   ├── cookbooks/         # Cookbook management
│   │   ├── classifications/   # Recipe classifications
│   │   ├── sources/          # Recipe sources
│   │   ├── meals/            # Meal types
│   │   ├── courses/          # Course types
│   │   ├── preparations/     # Preparation methods
│   │   ├── users/            # User management
│   │   └── admin/            # Admin endpoints
│   ├── (routes)/             # Frontend pages
│   └── globals.css           # Global styles
├── components/               # React components
├── lib/
│   ├── api.ts               # API client
│   ├── db.ts                # Prisma client
│   └── validations.ts       # Zod schemas
├── types/                   # TypeScript definitions
└── utils/                   # Utility functions

prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Database seeder

scripts/
└── test-api.js            # API testing script
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database (destructive)
- `npm run db:studio` - Open Prisma Studio

## 📊 API Endpoints

### Recipes
- `GET /api/recipes` - List recipes with filtering
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/[id]` - Get specific recipe
- `PUT /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe
- `GET /api/recipes/public` - List public recipes
- `GET /api/recipes/search` - Search recipes

### Cookbooks
- `GET /api/cookbooks` - List cookbooks
- `POST /api/cookbooks` - Create cookbook
- `GET /api/cookbooks/[id]` - Get specific cookbook
- `PUT /api/cookbooks/[id]` - Update cookbook
- `DELETE /api/cookbooks/[id]` - Delete cookbook
- `GET /api/cookbooks/public` - List public cookbooks
- `POST /api/cookbooks/[id]/recipes` - Add recipes to cookbook
- `PUT /api/cookbooks/[id]/recipes` - Reorder recipes in cookbook
- `DELETE /api/cookbooks/[id]/recipes/[recipeId]` - Remove recipe from cookbook

### Metadata
- `GET /api/classifications` - Recipe classifications
- `GET /api/sources` - Recipe sources
- `GET /api/meals` - Meal types
- `GET /api/courses` - Course types
- `GET /api/preparations` - Preparation methods

### Users & Admin
- `GET /api/users` - List users
- `GET /api/admin/stats` - Admin statistics
- `POST /api/admin/bulk` - Bulk operations

## 🗃️ Database Schema

The application uses the following main entities:

- **Users** - User accounts and subscription info
- **Recipes** - Recipe data with ingredients, instructions, nutrition
- **Cookbooks** - Collections of recipes with ordering
- **Classifications** - Recipe categories (Italian, Asian, etc.)
- **Sources** - Where recipes came from (Family, Online, etc.)
- **Meals** - When to eat (Breakfast, Lunch, Dinner, Snack)
- **Courses** - What type of dish (Appetizer, Main, Dessert, Side)
- **Preparations** - How it's cooked (Baked, Grilled, Fried, etc.)

## 🔐 Authentication

Authentication is not currently implemented but is planned using Clerk or Auth0. The current user management is for basic CRUD operations only.

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production database**
   - Update `DATABASE_URL` in your production environment
   - Run migrations: `npx prisma migrate deploy`

3. **Deploy to your platform** (Vercel, Railway, etc.)

## 🧪 Testing

Use the included test script to verify API functionality:

```bash
# Make sure your dev server is running first
npm run dev

# In another terminal
node scripts/test-api.js
```

## 📝 Migration Notes

This project is a complete migration from Laravel to Next.js:

- ✅ **Backend API** - All Laravel controllers converted to Next.js API routes
- ✅ **Database** - Schema migrated from Laravel migrations to Prisma
- ✅ **Validation** - Laravel FormRequests converted to Zod schemas
- ✅ **Frontend** - Blade templates converted to React components
- ✅ **Search** - Advanced search functionality maintained
- ⏳ **Authentication** - Planned integration with Clerk/Auth0
- ✅ **Admin Features** - Statistics and bulk operations

## 🐛 Troubleshooting

**Database Connection Issues:**
- Verify `DATABASE_URL` in `.env.local`
- Ensure MariaDB/MySQL is running
- Check database credentials and permissions

**Prisma Issues:**
- Run `npm run db:generate` to regenerate client
- Check `prisma/schema.prisma` for syntax errors

**Build Issues:**
- Clear `.next` folder and rebuild
- Update Node.js to version 18+

## 📄 License

This project maintains the same license as the original Laravel Recipes 2025 project.