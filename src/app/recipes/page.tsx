'use client';

import { useState, useEffect } from 'react';
import { Recipe } from '@/types';
import { api } from '@/lib/api';
import RecipeCard from '@/components/recipe/RecipeCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, Plus, Filter } from 'lucide-react';
import Link from 'next/link';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showPublicOnly, setShowPublicOnly] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, [showPublicOnly]);

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      const data = showPublicOnly ? await api.getPublicRecipes() : await api.getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadRecipes();
      return;
    }
    
    try {
      setIsLoading(true);
      const results = await api.searchRecipes({ query: searchQuery });
      setRecipes(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePrivacy = async (id: string) => {
    try {
      await api.toggleRecipePrivacy(id);
      loadRecipes(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to toggle privacy:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
      await api.deleteRecipe(id);
      loadRecipes(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {showPublicOnly ? 'Browse Recipes' : 'My Recipes'}
              </h1>
              <p className="mt-2 text-gray-600">
                {showPublicOnly 
                  ? 'Discover amazing recipes from our community'
                  : 'Manage and organize your recipe collection'
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPublicOnly(true)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    showPublicOnly
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Public
                </button>
                <button
                  onClick={() => setShowPublicOnly(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    !showPublicOnly
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  My Recipes
                </button>
              </div>
              
              {!showPublicOnly && (
                <Link href="/recipes/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Recipe
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              Search
            </Button>
          </div>
        </div>

        {/* Recipes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                showOwner={showPublicOnly}
                onTogglePrivacy={!showPublicOnly ? handleTogglePrivacy : undefined}
                onDelete={!showPublicOnly ? handleDelete : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No recipes found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? `No recipes match "${searchQuery}". Try a different search term.`
                  : showPublicOnly
                  ? 'No public recipes are available yet.'
                  : 'You haven\'t created any recipes yet. Create your first recipe to get started!'
                }
              </p>
              {!showPublicOnly && (
                <Link href="/recipes/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Recipe
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}