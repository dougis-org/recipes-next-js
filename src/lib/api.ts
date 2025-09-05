import { 
  Recipe, 
  Cookbook, 
  User, 
  Classification, 
  Source, 
  Meal, 
  Course, 
  Preparation,
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  RecipeFormData,
  CookbookFormData,
  SearchFilters
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// API client with token management
class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints (TODO: Implement with Clerk or Auth0)
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    throw new Error('Authentication not implemented yet');
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    throw new Error('Authentication not implemented yet');
  }

  async logout(): Promise<void> {
    this.setToken(null);
  }

  async getCurrentUser(): Promise<User> {
    throw new Error('Authentication not implemented yet');
  }

  // Recipe endpoints
  async getRecipes(): Promise<Recipe[]> {
    const response = await this.request<Recipe[]>('/recipes');
    return response.data;
  }

  async getPublicRecipes(): Promise<Recipe[]> {
    const response = await this.request<Recipe[]>('/recipes/public');
    return response.data;
  }

  async getRecipe(id: string): Promise<Recipe> {
    const response = await this.request<Recipe>(`/recipes/${id}`);
    return response.data;
  }

  async createRecipe(data: RecipeFormData): Promise<Recipe> {
    const response = await this.request<Recipe>('/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateRecipe(id: string, data: RecipeFormData): Promise<Recipe> {
    const response = await this.request<Recipe>(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteRecipe(id: string): Promise<void> {
    await this.request(`/recipes/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleRecipePrivacy(id: string): Promise<Recipe> {
    // Get current recipe
    const recipe = await this.getRecipe(id);
    // Update with toggled privacy
    return this.updateRecipe(id, { 
      ...recipe, 
      is_private: !recipe.is_private 
    } as RecipeFormData);
  }

  async searchRecipes(filters: SearchFilters): Promise<Recipe[]> {
    const params = new URLSearchParams();
    if (filters.query) params.append('q', filters.query);
    if (filters.classification_id) params.append('classificationId', filters.classification_id);
    if (filters.source_id) params.append('sourceId', filters.source_id);
    if (filters.meal_ids?.length) params.append('mealIds', filters.meal_ids.join(','));
    if (filters.course_ids?.length) params.append('courseIds', filters.course_ids.join(','));
    if (filters.preparation_ids?.length) params.append('preparationIds', filters.preparation_ids.join(','));
    if (filters.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters.is_private !== undefined) params.append('isPrivate', filters.is_private.toString());

    const response = await this.request<Recipe[]>(`/recipes/search?${params.toString()}`);
    return response.data;
  }

  // Cookbook endpoints
  async getCookbooks(): Promise<Cookbook[]> {
    const response = await this.request<Cookbook[]>('/cookbooks');
    return response.data;
  }

  async getPublicCookbooks(): Promise<Cookbook[]> {
    const response = await this.request<Cookbook[]>('/cookbooks/public');
    return response.data;
  }

  async getCookbook(id: string): Promise<Cookbook> {
    const response = await this.request<Cookbook>(`/cookbooks/${id}`);
    return response.data;
  }

  async createCookbook(data: CookbookFormData): Promise<Cookbook> {
    const response = await this.request<Cookbook>('/cookbooks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateCookbook(id: string, data: CookbookFormData): Promise<Cookbook> {
    const response = await this.request<Cookbook>(`/cookbooks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteCookbook(id: string): Promise<void> {
    await this.request(`/cookbooks/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleCookbookPrivacy(id: string): Promise<Cookbook> {
    // Get current cookbook
    const cookbook = await this.getCookbook(id);
    // Update with toggled privacy
    return this.updateCookbook(id, { 
      ...cookbook, 
      is_private: !cookbook.is_private 
    } as CookbookFormData);
  }

  async addRecipesToCookbook(cookbookId: string, recipeIds: string[]): Promise<void> {
    await this.request(`/cookbooks/${cookbookId}/recipes`, {
      method: 'POST',
      body: JSON.stringify({ recipeIds }),
    });
  }

  async removeRecipeFromCookbook(cookbookId: string, recipeId: string): Promise<void> {
    await this.request(`/cookbooks/${cookbookId}/recipes/${recipeId}`, {
      method: 'DELETE',
    });
  }

  async reorderCookbookRecipes(cookbookId: string, recipeOrder: Record<string, number>): Promise<void> {
    await this.request(`/cookbooks/${cookbookId}/recipes`, {
      method: 'PUT',
      body: JSON.stringify({ recipeOrder }),
    });
  }

  // Metadata endpoints
  async getClassifications(): Promise<Classification[]> {
    const response = await this.request<Classification[]>('/classifications');
    return response.data;
  }

  async getSources(): Promise<Source[]> {
    const response = await this.request<Source[]>('/sources');
    return response.data;
  }

  async getMeals(): Promise<Meal[]> {
    const response = await this.request<Meal[]>('/meals');
    return response.data;
  }

  async getCourses(): Promise<Course[]> {
    const response = await this.request<Course[]>('/courses');
    return response.data;
  }

  async getPreparations(): Promise<Preparation[]> {
    const response = await this.request<Preparation[]>('/preparations');
    return response.data;
  }
}

// Export singleton instance
export const api = new ApiClient();