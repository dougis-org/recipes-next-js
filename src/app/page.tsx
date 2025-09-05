'use client';

import { useState, useEffect } from 'react';
import { Recipe, Cookbook } from '@/types';
import { api } from '@/lib/api';
import RecipeCard from '@/components/recipe/RecipeCard';
import CookbookCard from '@/components/cookbook/CookbookCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, ChefHat, Book, Users, Star } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [publicRecipes, setPublicRecipes] = useState<Recipe[]>([]);
  const [publicCookbooks, setPublicCookbooks] = useState<Cookbook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPublicContent = async () => {
      try {
        const [recipes, cookbooks] = await Promise.all([
          api.getPublicRecipes(),
          api.getPublicCookbooks()
        ]);
        
        setPublicRecipes(recipes.slice(0, 8)); // Show first 8 recipes
        setPublicCookbooks(cookbooks.slice(0, 4)); // Show first 4 cookbooks
      } catch (error) {
        console.error('Failed to load public content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicContent();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await api.searchRecipes({ query: searchQuery });
      setPublicRecipes(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading delicious content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ChefHat className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Recipes Next.js
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover, create, and share amazing recipes with our community
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for recipes..."
                    className="pl-10 py-3 text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/recipes">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Browse Recipes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Recipes Next.js?
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to manage your culinary journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <ChefHat className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Recipe Management</h3>
              <p className="text-gray-600">
                Create, edit, and organize your recipes with advanced search and categorization
              </p>
            </div>
            
            <div className="text-center">
              <Book className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Custom Cookbooks</h3>
              <p className="text-gray-600">
                Compile your favorite recipes into beautiful, shareable cookbooks
              </p>
            </div>
            
            <div className="text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600">
                Share recipes with friends or keep them private - you choose
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Recipes Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Recipes
            </h2>
            <Link href="/recipes">
              <Button variant="outline">
                View All Recipes
              </Button>
            </Link>
          </div>

          {publicRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {publicRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  showOwner={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No public recipes available yet. Be the first to share!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Featured Cookbooks Section */}
      {publicCookbooks.length > 0 && (
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Cookbooks
              </h2>
              <Link href="/cookbooks">
                <Button variant="outline">
                  View All Cookbooks
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {publicCookbooks.map((cookbook) => (
                <CookbookCard
                  key={cookbook.id}
                  cookbook={cookbook}
                  showOwner={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Culinary Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of home chefs sharing their favorite recipes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
