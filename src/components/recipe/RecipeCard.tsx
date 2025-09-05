'use client';

import { Recipe } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Clock, Users, Eye, EyeOff, Star, Tag } from 'lucide-react';
import Link from 'next/link';

interface RecipeCardProps {
  recipe: Recipe;
  showOwner?: boolean;
  onTogglePrivacy?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function RecipeCard({
  recipe,
  showOwner = false,
  onTogglePrivacy,
  onDelete,
}: RecipeCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            <Link href={`/recipes/${recipe.id}`} className="hover:underline">
              {recipe.name}
            </Link>
          </CardTitle>
          <div className="flex items-center space-x-1">
            {recipe.marked && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
            {recipe.is_private ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
        
        {showOwner && recipe.user && (
          <p className="text-sm text-gray-500">
            by {recipe.user.name}
          </p>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Recipe Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {new Date(recipe.date_added).toLocaleDateString()}
            </div>
          </div>

          {/* Ingredients Preview */}
          <div>
            <p className="text-sm text-gray-600 line-clamp-3">
              {recipe.ingredients.length > 150
                ? recipe.ingredients.substring(0, 150) + '...'
                : recipe.ingredients}
            </p>
          </div>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div className="flex items-center flex-wrap gap-2">
              <Tag className="h-3 w-3 text-gray-400" />
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{recipe.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Nutritional Info */}
          {recipe.calories && (
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Calories: {recipe.calories}</span>
              {recipe.protein && <span>Protein: {recipe.protein}g</span>}
              {recipe.fat && <span>Fat: {recipe.fat}g</span>}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Link href={`/recipes/${recipe.id}`}>
              <Button variant="primary" size="sm">
                View Recipe
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2">
              {onTogglePrivacy && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTogglePrivacy(recipe.id)}
                  title={recipe.is_private ? 'Make Public' : 'Make Private'}
                >
                  {recipe.is_private ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(recipe.id)}
                  title="Delete Recipe"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}