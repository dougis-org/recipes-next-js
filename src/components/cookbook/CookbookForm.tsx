'use client';

import { useState } from 'react';
import { Cookbook, CookbookFormData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

interface CookbookFormProps {
  cookbook?: Cookbook;
  onSubmit: (data: CookbookFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function CookbookForm({ cookbook, onSubmit, onCancel, isLoading = false }: CookbookFormProps) {
  const [formData, setFormData] = useState<CookbookFormData>({
    name: cookbook?.name || '',
    description: cookbook?.description || '',
    cover_image: cookbook?.cover_image || '',
    is_private: cookbook?.is_private || false,
  });

  const handleInputChange = (field: keyof CookbookFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {cookbook ? 'Edit Cookbook' : 'Create New Cookbook'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Input
            label="Cookbook Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            placeholder="Enter cookbook name"
          />

          <Textarea
            label="Description (Optional)"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your cookbook"
            rows={4}
          />

          <Input
            label="Cover Image URL (Optional)"
            value={formData.cover_image}
            onChange={(e) => handleInputChange('cover_image', e.target.value)}
            placeholder="https://example.com/image.jpg"
            type="url"
          />

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
                Make this cookbook private (Tier 2+ only)
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
              {isLoading ? 'Saving...' : cookbook ? 'Update Cookbook' : 'Create Cookbook'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}