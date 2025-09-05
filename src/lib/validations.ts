import { z } from 'zod';

// Recipe validation schemas
export const recipeCreateSchema = z.object({
  name: z.string().min(1, 'Recipe name is required').max(255),
  ingredients: z.string().min(1, 'Ingredients are required'),
  instructions: z.string().min(1, 'Instructions are required'),
  notes: z.string().optional(),
  servings: z.number().int().min(1, 'Servings must be at least 1'),
  sourceId: z.string().optional(),
  classificationId: z.string().optional(),
  calories: z.number().int().min(0).optional(),
  fat: z.number().min(0).optional(),
  cholesterol: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  marked: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  mealIds: z.array(z.string()).default([]),
  courseIds: z.array(z.string()).default([]),
  preparationIds: z.array(z.string()).default([]),
  isPrivate: z.boolean().default(false),
  userId: z.string().min(1, 'User ID is required'), // For now, we'll pass this manually
});

export const recipeUpdateSchema = recipeCreateSchema.partial().extend({
  id: z.string().min(1, 'Recipe ID is required'),
});

export const recipeQuerySchema = z.object({
  query: z.string().optional(),
  classificationId: z.string().optional(),
  sourceId: z.string().optional(),
  mealIds: z.array(z.string()).optional(),
  courseIds: z.array(z.string()).optional(),
  preparationIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
  userId: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Cookbook validation schemas
export const cookbookCreateSchema = z.object({
  name: z.string().min(1, 'Cookbook name is required').max(255),
  description: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  isPrivate: z.boolean().default(false),
  userId: z.string().min(1, 'User ID is required'), // For now, we'll pass this manually
});

export const cookbookUpdateSchema = cookbookCreateSchema.partial().extend({
  id: z.string().min(1, 'Cookbook ID is required'),
});

export const cookbookAddRecipesSchema = z.object({
  recipeIds: z.array(z.string().min(1)).min(1, 'At least one recipe ID is required'),
});

export const cookbookReorderRecipesSchema = z.object({
  recipeOrder: z.record(z.string(), z.number().int().min(0)),
});

// Metadata validation schemas
export const metadataCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
});

export const metadataUpdateSchema = metadataCreateSchema.partial().extend({
  id: z.string().min(1, 'ID is required'),
});

// User validation schemas (for basic operations without auth)
export const userCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Valid email is required'),
  subscriptionTier: z.number().int().min(0).max(100).default(0),
  subscriptionStatus: z.string().default('free'),
  adminOverride: z.boolean().default(false),
});

export const userUpdateSchema = userCreateSchema.partial().extend({
  id: z.string().min(1, 'User ID is required'),
});

// Common query schemas
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const searchSchema = z.object({
  query: z.string().min(1),
  ...paginationSchema.shape,
});