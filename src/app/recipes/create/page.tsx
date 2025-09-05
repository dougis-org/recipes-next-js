'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeFormData } from '@/types';
import { api } from '@/lib/api';
import RecipeForm from '@/components/recipe/RecipeForm';

export default function CreateRecipePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: RecipeFormData) => {
    try {
      setIsLoading(true);
      const recipe = await api.createRecipe(data);
      router.push(`/recipes/${recipe.id}`);
    } catch (error) {
      console.error('Failed to create recipe:', error);
      alert('Failed to create recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RecipeForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}