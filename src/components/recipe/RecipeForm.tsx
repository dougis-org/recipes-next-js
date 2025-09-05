'use client';

import { useState, useEffect } from 'react';
import { Recipe, RecipeFormData, Classification, Source, Meal, Course, Preparation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { api } from '@/lib/api';

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: RecipeFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function RecipeForm({ recipe, onSubmit, onCancel, isLoading = false }: RecipeFormProps) {
  const [formData, setFormData] = useState<RecipeFormData>({
    name: recipe?.name || '',
    ingredients: recipe?.ingredients || '',
    instructions: recipe?.instructions || '',
    notes: recipe?.notes || '',
    servings: recipe?.servings || 1,
    source_id: recipe?.source_id || '',
    classification_id: recipe?.classification_id || '',
    calories: recipe?.calories || undefined,
    fat: recipe?.fat || undefined,
    cholesterol: recipe?.cholesterol || undefined,
    sodium: recipe?.sodium || undefined,
    protein: recipe?.protein || undefined,
    tags: recipe?.tags || [],
    meal_ids: recipe?.meal_ids || [],
    preparation_ids: recipe?.preparation_ids || [],
    course_ids: recipe?.course_ids || [],
    is_private: recipe?.is_private || false,
  });

  const [metadata, setMetadata] = useState({
    classifications: [] as Classification[],
    sources: [] as Source[],
    meals: [] as Meal[],
    courses: [] as Course[],
    preparations: [] as Preparation[],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [classifications, sources, meals, courses, preparations] = await Promise.all([
          api.getClassifications(),
          api.getSources(),
          api.getMeals(),
          api.getCourses(),
          api.getPreparations(),
        ]);

        setMetadata({
          classifications,
          sources,
          meals,
          courses,
          preparations,
        });
      } catch (error) {
        console.error('Failed to load metadata:', error);
      }
    };

    loadMetadata();
  }, []);

  const handleInputChange = (field: keyof RecipeFormData, value: string | number | boolean | string[] | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleMultiSelectChange = (field: 'meal_ids' | 'course_ids' | 'preparation_ids', value: string) => {
    setFormData(prev => {
      const currentValues = prev[field];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(id => id !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [field]: newValues,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {recipe ? 'Edit Recipe' : 'Create New Recipe'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Recipe Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              placeholder="Enter recipe name"
            />
            
            <Input
              label="Servings"
              type="number"
              value={formData.servings}
              onChange={(e) => handleInputChange('servings', parseInt(e.target.value) || 1)}
              required
              min="1"
            />
          </div>

          {/* Ingredients and Instructions */}
          <div className="space-y-4">
            <Textarea
              label="Ingredients"
              value={formData.ingredients}
              onChange={(e) => handleInputChange('ingredients', e.target.value)}
              required
              placeholder="List ingredients, one per line"
              rows={8}
            />
            
            <Textarea
              label="Instructions"
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              required
              placeholder="Step-by-step cooking instructions"
              rows={8}
            />
            
            <Textarea
              label="Notes (Optional)"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes, tips, or variations"
              rows={4}
            />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classification
              </label>
              <select
                value={formData.classification_id}
                onChange={(e) => handleInputChange('classification_id', e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select Classification</option>
                {metadata.classifications.map(classification => (
                  <option key={classification.id} value={classification.id}>
                    {classification.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={formData.source_id}
                onChange={(e) => handleInputChange('source_id', e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select Source</option>
                {metadata.sources.map(source => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Multi-select Metadata */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Types
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {metadata.meals.map(meal => (
                  <label key={meal.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.meal_ids.includes(meal.id)}
                      onChange={() => handleMultiSelectChange('meal_ids', meal.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">{meal.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Courses
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {metadata.courses.map(course => (
                  <label key={course.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.course_ids.includes(course.id)}
                      onChange={() => handleMultiSelectChange('course_ids', course.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">{course.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preparation Methods
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {metadata.preparations.map(preparation => (
                  <label key={preparation.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preparation_ids.includes(preparation.id)}
                      onChange={() => handleMultiSelectChange('preparation_ids', preparation.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">{preparation.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
              />
              <Button type="button" onClick={handleTagAdd} variant="outline">
                Add Tag
              </Button>
            </div>
          </div>

          {/* Nutritional Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Nutritional Information (Optional)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Input
                label="Calories"
                type="number"
                value={formData.calories || ''}
                onChange={(e) => handleInputChange('calories', e.target.value ? parseInt(e.target.value) : undefined)}
                min="0"
              />
              <Input
                label="Protein (g)"
                type="number"
                value={formData.protein || ''}
                onChange={(e) => handleInputChange('protein', e.target.value ? parseFloat(e.target.value) : undefined)}
                min="0"
                step="0.1"
              />
              <Input
                label="Fat (g)"
                type="number"
                value={formData.fat || ''}
                onChange={(e) => handleInputChange('fat', e.target.value ? parseFloat(e.target.value) : undefined)}
                min="0"
                step="0.1"
              />
              <Input
                label="Sodium (mg)"
                type="number"
                value={formData.sodium || ''}
                onChange={(e) => handleInputChange('sodium', e.target.value ? parseFloat(e.target.value) : undefined)}
                min="0"
                step="0.1"
              />
              <Input
                label="Cholesterol (mg)"
                type="number"
                value={formData.cholesterol || ''}
                onChange={(e) => handleInputChange('cholesterol', e.target.value ? parseFloat(e.target.value) : undefined)}
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_private}
                onChange={(e) => handleInputChange('is_private', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Make this recipe private (Tier 2+ only)
              </span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : recipe ? 'Update Recipe' : 'Create Recipe'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}