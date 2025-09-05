'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Recipe } from '@/types';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Clock, Users, Eye, EyeOff, Star, Tag, Edit, Trash2, ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';

export default function RecipeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadRecipe(params.id as string);
    }
  }, [params.id]);

  const loadRecipe = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getRecipe(id);
      setRecipe(data);
    } catch (error) {
      console.error('Failed to load recipe:', error);
      setError('Failed to load recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePrivacy = async () => {
    if (!recipe) return;
    
    try {
      const updatedRecipe = await api.toggleRecipePrivacy(recipe.id);
      setRecipe(updatedRecipe);
    } catch (error) {
      console.error('Failed to toggle privacy:', error);
      alert('Failed to update privacy setting. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!recipe) return;
    
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.deleteRecipe(recipe.id);
      router.push('/recipes');
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || 'The recipe you\'re looking for doesn\'t exist or may have been deleted.'}
            </p>
            <div className="space-x-4">
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
              <Link href="/recipes">
                <Button>Browse Recipes</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Recipe Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {recipe.marked && (
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  )}
                  {recipe.is_private ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  {recipe.name}
                </CardTitle>
                
                {recipe.user && (
                  <p className="text-gray-600">
                    by {recipe.user.name}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" title="Print Recipe">
                  <Printer className="h-4 w-4" />
                </Button>
                
                <Link href={`/recipes/${recipe.id}/edit`}>
                  <Button variant="outline" size="sm" title="Edit Recipe">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTogglePrivacy}
                  title={recipe.is_private ? 'Make Public' : 'Make Private'}
                >
                  {recipe.is_private ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  title="Delete Recipe"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Recipe Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Added {new Date(recipe.date_added).toLocaleDateString()}
              </div>
            </div>

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 mb-6">
                <Tag className="h-4 w-4 text-gray-400" />
                {recipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Nutritional Information */}
            {(recipe.calories || recipe.protein || recipe.fat || recipe.sodium || recipe.cholesterol) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Nutritional Information</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                  {recipe.calories && (
                    <div>
                      <span className="text-gray-500">Calories:</span>
                      <span className="block font-medium">{recipe.calories}</span>
                    </div>
                  )}
                  {recipe.protein && (
                    <div>
                      <span className="text-gray-500">Protein:</span>
                      <span className="block font-medium">{recipe.protein}g</span>
                    </div>
                  )}
                  {recipe.fat && (
                    <div>
                      <span className="text-gray-500">Fat:</span>
                      <span className="block font-medium">{recipe.fat}g</span>
                    </div>
                  )}
                  {recipe.sodium && (
                    <div>
                      <span className="text-gray-500">Sodium:</span>
                      <span className="block font-medium">{recipe.sodium}mg</span>
                    </div>
                  )}
                  {recipe.cholesterol && (
                    <div>
                      <span className="text-gray-500">Cholesterol:</span>
                      <span className="block font-medium">{recipe.cholesterol}mg</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {recipe.ingredients}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {recipe.instructions}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {recipe.notes && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {recipe.notes}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recipe Metadata */}
        {(recipe.source || recipe.classification || recipe.meals?.length || recipe.courses?.length || recipe.preparations?.length) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recipe Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recipe.source && (
                <div>
                  <span className="font-medium text-gray-900">Source:</span>
                  <span className="ml-2 text-gray-700">{recipe.source.name}</span>
                </div>
              )}
              
              {recipe.classification && (
                <div>
                  <span className="font-medium text-gray-900">Classification:</span>
                  <span className="ml-2 text-gray-700">{recipe.classification.name}</span>
                </div>
              )}
              
              {recipe.meals && recipe.meals.length > 0 && (
                <div>
                  <span className="font-medium text-gray-900">Meal Types:</span>
                  <span className="ml-2 text-gray-700">
                    {recipe.meals.map(meal => meal.name).join(', ')}
                  </span>
                </div>
              )}
              
              {recipe.courses && recipe.courses.length > 0 && (
                <div>
                  <span className="font-medium text-gray-900">Courses:</span>
                  <span className="ml-2 text-gray-700">
                    {recipe.courses.map(course => course.name).join(', ')}
                  </span>
                </div>
              )}
              
              {recipe.preparations && recipe.preparations.length > 0 && (
                <div>
                  <span className="font-medium text-gray-900">Preparation Methods:</span>
                  <span className="ml-2 text-gray-700">
                    {recipe.preparations.map(prep => prep.name).join(', ')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}