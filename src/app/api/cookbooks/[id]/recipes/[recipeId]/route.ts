import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Remove a recipe from cookbook
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; recipeId: string } }
) {
  try {
    // Check if cookbook exists
    const existingCookbook = await prisma.cookbook.findUnique({
      where: { id: params.id }
    });

    if (!existingCookbook) {
      return NextResponse.json({
        success: false,
        message: 'Cookbook not found'
      }, { status: 404 });
    }

    // Check if recipe is in the cookbook
    const cookbookRecipe = await prisma.cookbookRecipe.findUnique({
      where: {
        cookbookId_recipeId: {
          cookbookId: params.id,
          recipeId: params.recipeId
        }
      }
    });

    if (!cookbookRecipe) {
      return NextResponse.json({
        success: false,
        message: 'Recipe not found in this cookbook'
      }, { status: 404 });
    }

    // Remove the recipe from cookbook
    await prisma.cookbookRecipe.delete({
      where: {
        cookbookId_recipeId: {
          cookbookId: params.id,
          recipeId: params.recipeId
        }
      }
    });

    // Optionally reorder remaining recipes to close gaps
    const remainingRecipes = await prisma.cookbookRecipe.findMany({
      where: { cookbookId: params.id },
      orderBy: { order: 'asc' }
    });

    // Update order to remove gaps
    for (let i = 0; i < remainingRecipes.length; i++) {
      if (remainingRecipes[i].order !== i + 1) {
        await prisma.cookbookRecipe.update({
          where: {
            cookbookId_recipeId: {
              cookbookId: params.id,
              recipeId: remainingRecipes[i].recipeId
            }
          },
          data: { order: i + 1 }
        });
      }
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
      message: 'Recipe removed from cookbook successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error removing recipe from cookbook:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}