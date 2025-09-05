import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookbookAddRecipesSchema, cookbookReorderRecipesSchema } from '@/lib/validations';
import { z } from 'zod';

// Add recipes to cookbook
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = cookbookAddRecipesSchema.parse(body);

    // Check if cookbook exists
    const existingCookbook = await prisma.cookbook.findUnique({
      where: { id: params.id },
      include: {
        recipes: true
      }
    });

    if (!existingCookbook) {
      return NextResponse.json({
        success: false,
        message: 'Cookbook not found'
      }, { status: 404 });
    }

    // Check if recipes exist
    const recipes = await prisma.recipe.findMany({
      where: {
        id: { in: validatedData.recipeIds }
      }
    });

    if (recipes.length !== validatedData.recipeIds.length) {
      return NextResponse.json({
        success: false,
        message: 'One or more recipes not found'
      }, { status: 404 });
    }

    // Get current max order for the cookbook
    const maxOrder = await prisma.cookbookRecipe.findFirst({
      where: { cookbookId: params.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    let nextOrder = (maxOrder?.order || 0) + 1;

    // Filter out recipes that are already in the cookbook
    const existingRecipeIds = existingCookbook.recipes.map(r => r.recipeId);
    const newRecipeIds = validatedData.recipeIds.filter(id => !existingRecipeIds.includes(id));

    if (newRecipeIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'All recipes are already in this cookbook'
      }, { status: 400 });
    }

    // Add new recipes to cookbook
    await prisma.cookbookRecipe.createMany({
      data: newRecipeIds.map(recipeId => ({
        cookbookId: params.id,
        recipeId,
        order: nextOrder++,
      })),
    });

    // Fetch updated cookbook
    const updatedCookbook = await prisma.cookbook.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        recipes: {
          include: {
            recipe: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                },
                source: true,
                classification: true,
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
      },
    });

    if (!updatedCookbook) {
      return NextResponse.json({
        success: false,
        message: 'Cookbook updated but could not be retrieved'
      }, { status: 500 });
    }

    // Transform the data
    const transformedCookbook = {
      id: updatedCookbook.id,
      user_id: updatedCookbook.userId,
      name: updatedCookbook.name,
      description: updatedCookbook.description,
      cover_image: updatedCookbook.coverImage,
      recipe_ids: updatedCookbook.recipes.map(r => ({
        recipe_id: r.recipeId,
        order: r.order,
      })),
      is_private: updatedCookbook.isPrivate,
      created_at: updatedCookbook.createdAt.toISOString(),
      updated_at: updatedCookbook.updatedAt.toISOString(),
      user: updatedCookbook.user,
      recipes: updatedCookbook.recipes.map(r => ({
        id: r.recipe.id,
        user_id: r.recipe.userId,
        name: r.recipe.name,
        ingredients: r.recipe.ingredients,
        instructions: r.recipe.instructions,
        notes: r.recipe.notes,
        servings: r.recipe.servings,
        source_id: r.recipe.sourceId,
        classification_id: r.recipe.classificationId,
        date_added: r.recipe.dateAdded.toISOString(),
        calories: r.recipe.calories,
        fat: r.recipe.fat,
        cholesterol: r.recipe.cholesterol,
        sodium: r.recipe.sodium,
        protein: r.recipe.protein,
        marked: r.recipe.marked,
        tags: r.recipe.tags ? JSON.parse(r.recipe.tags) : [],
        meal_ids: [],
        preparation_ids: [],
        course_ids: [],
        is_private: r.recipe.isPrivate,
        created_at: r.recipe.createdAt.toISOString(),
        updated_at: r.recipe.updatedAt.toISOString(),
        user: r.recipe.user,
        source: r.recipe.source,
        classification: r.recipe.classification,
        order: r.order,
      })),
    };

    return NextResponse.json({
      success: true,
      data: transformedCookbook,
      message: `Added ${newRecipeIds.length} recipes to cookbook`,
      meta: {
        api_version: 'v1',
        added_count: newRecipeIds.length,
        skipped_count: validatedData.recipeIds.length - newRecipeIds.length
      }
    });

  } catch (error) {
    console.error('Error adding recipes to cookbook:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid recipe data',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// Reorder recipes in cookbook
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = cookbookReorderRecipesSchema.parse(body);

    // Check if cookbook exists
    const existingCookbook = await prisma.cookbook.findUnique({
      where: { id: params.id },
      include: {
        recipes: true
      }
    });

    if (!existingCookbook) {
      return NextResponse.json({
        success: false,
        message: 'Cookbook not found'
      }, { status: 404 });
    }

    // Verify all recipe IDs belong to this cookbook
    const cookbookRecipeIds = existingCookbook.recipes.map(r => r.recipeId);
    const reorderRecipeIds = Object.keys(validatedData.recipeOrder);
    
    const invalidRecipeIds = reorderRecipeIds.filter(id => !cookbookRecipeIds.includes(id));
    if (invalidRecipeIds.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Some recipes are not in this cookbook',
        invalid_recipe_ids: invalidRecipeIds
      }, { status: 400 });
    }

    // Update the order for each recipe
    for (const [recipeId, order] of Object.entries(validatedData.recipeOrder)) {
      await prisma.cookbookRecipe.update({
        where: {
          cookbookId_recipeId: {
            cookbookId: params.id,
            recipeId: recipeId
          }
        },
        data: { order }
      });
    }

    // Fetch updated cookbook
    const updatedCookbook = await prisma.cookbook.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        recipes: {
          include: {
            recipe: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                },
                source: true,
                classification: true,
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
      },
    });

    if (!updatedCookbook) {
      return NextResponse.json({
        success: false,
        message: 'Cookbook updated but could not be retrieved'
      }, { status: 500 });
    }

    // Transform the data
    const transformedCookbook = {
      id: updatedCookbook.id,
      user_id: updatedCookbook.userId,
      name: updatedCookbook.name,
      description: updatedCookbook.description,
      cover_image: updatedCookbook.coverImage,
      recipe_ids: updatedCookbook.recipes.map(r => ({
        recipe_id: r.recipeId,
        order: r.order,
      })),
      is_private: updatedCookbook.isPrivate,
      created_at: updatedCookbook.createdAt.toISOString(),
      updated_at: updatedCookbook.updatedAt.toISOString(),
      user: updatedCookbook.user,
      recipes: updatedCookbook.recipes.map(r => ({
        id: r.recipe.id,
        user_id: r.recipe.userId,
        name: r.recipe.name,
        ingredients: r.recipe.ingredients,
        instructions: r.recipe.instructions,
        notes: r.recipe.notes,
        servings: r.recipe.servings,
        source_id: r.recipe.sourceId,
        classification_id: r.recipe.classificationId,
        date_added: r.recipe.dateAdded.toISOString(),
        calories: r.recipe.calories,
        fat: r.recipe.fat,
        cholesterol: r.recipe.cholesterol,
        sodium: r.recipe.sodium,
        protein: r.recipe.protein,
        marked: r.recipe.marked,
        tags: r.recipe.tags ? JSON.parse(r.recipe.tags) : [],
        meal_ids: [],
        preparation_ids: [],
        course_ids: [],
        is_private: r.recipe.isPrivate,
        created_at: r.recipe.createdAt.toISOString(),
        updated_at: r.recipe.updatedAt.toISOString(),
        user: r.recipe.user,
        source: r.recipe.source,
        classification: r.recipe.classification,
        order: r.order,
      })),
    };

    return NextResponse.json({
      success: true,
      data: transformedCookbook,
      message: 'Recipe order updated successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error reordering recipes in cookbook:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid reorder data',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}