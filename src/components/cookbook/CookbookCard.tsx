'use client';

import { Cookbook } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Book, Eye, EyeOff, Users } from 'lucide-react';
import Link from 'next/link';

interface CookbookCardProps {
  cookbook: Cookbook;
  showOwner?: boolean;
  onTogglePrivacy?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function CookbookCard({
  cookbook,
  showOwner = false,
  onTogglePrivacy,
  onDelete,
}: CookbookCardProps) {
  const recipeCount = cookbook.recipe_ids?.length || 0;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Book className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                <Link href={`/cookbooks/${cookbook.id}`} className="hover:underline">
                  {cookbook.name}
                </Link>
              </CardTitle>
              {showOwner && cookbook.user && (
                <p className="text-sm text-gray-500 mt-1">
                  by {cookbook.user.name}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {cookbook.is_private ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Description */}
          {cookbook.description && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {cookbook.description}
            </p>
          )}

          {/* Recipe Count */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>
              {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
            </span>
          </div>

          {/* Created Date */}
          <div className="text-xs text-gray-500">
            Created on {new Date(cookbook.created_at).toLocaleDateString()}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Link href={`/cookbooks/${cookbook.id}`}>
              <Button variant="primary" size="sm">
                View Cookbook
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2">
              {onTogglePrivacy && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTogglePrivacy(cookbook.id)}
                  title={cookbook.is_private ? 'Make Public' : 'Make Private'}
                >
                  {cookbook.is_private ? (
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
                  onClick={() => onDelete(cookbook.id)}
                  title="Delete Cookbook"
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