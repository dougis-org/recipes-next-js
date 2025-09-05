// User types
export interface User {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  subscription_tier: number;
  subscription_status: string;
  subscription_expires_at: string | null;
  admin_override: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

// Recipe types
export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  ingredients: string;
  instructions: string;
  notes?: string;
  servings: number;
  source_id?: string;
  classification_id?: string;
  date_added: string;
  calories?: number;
  fat?: number;
  cholesterol?: number;
  sodium?: number;
  protein?: number;
  marked: boolean;
  tags: string[];
  meal_ids: string[];
  preparation_ids: string[];
  course_ids: string[];
  is_private: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: User;
  source?: Source;
  classification?: Classification;
  meals?: Meal[];
  courses?: Course[];
  preparations?: Preparation[];
}

// Cookbook types
export interface Cookbook {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_image?: string;
  recipe_ids: RecipeOrder[];
  is_private: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: User;
  recipes?: Recipe[];
}

export interface RecipeOrder {
  recipe_id: string;
  order: number;
}

// Metadata types
export interface Classification {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Preparation {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    pagination?: PaginationMeta;
    api_version: string;
  };
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

// Form types
export interface RecipeFormData {
  name: string;
  ingredients: string;
  instructions: string;
  notes?: string;
  servings: number;
  source_id?: string;
  classification_id?: string;
  calories?: number;
  fat?: number;
  cholesterol?: number;
  sodium?: number;
  protein?: number;
  tags: string[];
  meal_ids: string[];
  preparation_ids: string[];
  course_ids: string[];
  is_private: boolean;
}

export interface CookbookFormData {
  name: string;
  description?: string;
  cover_image?: string;
  is_private: boolean;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}

// Search types
export interface SearchFilters {
  query?: string;
  classification_id?: string;
  source_id?: string;
  meal_ids?: string[];
  course_ids?: string[];
  preparation_ids?: string[];
  tags?: string[];
  is_private?: boolean;
}

// Auth types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Subscription types
export interface SubscriptionTier {
  tier: number;
  name: string;
  price: number;
  features: string[];
  recipe_limit: number | null;
  cookbook_limit: number | null;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    tier: 0,
    name: 'Free',
    price: 0,
    features: ['Up to 25 public recipes', '1 public cookbook', 'Basic search'],
    recipe_limit: 25,
    cookbook_limit: 1,
  },
  {
    tier: 1,
    name: 'Tier 1',
    price: 9.99,
    features: ['Unlimited public recipes', '10 cookbooks', 'Advanced search', 'PDF export'],
    recipe_limit: null,
    cookbook_limit: 10,
  },
  {
    tier: 2,
    name: 'Tier 2',
    price: 19.99,
    features: ['Everything from Tier 1', 'Privacy controls', 'Unlimited cookbooks', 'Advanced features'],
    recipe_limit: null,
    cookbook_limit: null,
  },
];