import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookbookUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookbook = await prisma.cookbook.findUnique({
      where: {
        id: params.id,
      },
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

    if (!cookbook) {
      return NextResponse.json({
        success: false,
        message: 'Cookbook not found'
      }, { status: 404 });
    }

    // Transform the data to match the frontend types
    const transformedCookbook = {
      id: cookbook.id,
      user_id: cookbook.userId,
      name: cookbook.name,
      description: cookbook.description,
      cover_image: cookbook.coverImage,
      recipe_ids: cookbook.recipes.map(r => ({
        recipe_id: r.recipeId,
        order: r.order,
      })),
      is_private: cookbook.isPrivate,
      created_at: cookbook.createdAt.toISOString(),
      updated_at: cookbook.updatedAt.toISOString(),
      user: cookbook.user,
      recipes: cookbook.recipes.map(r => ({
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
      message: 'Cookbook retrieved successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error fetching cookbook:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = cookbookUpdateSchema.parse({ ...body, id: params.id });

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

    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.coverImage !== undefined) updateData.coverImage = validatedData.coverImage;
    if (validatedData.isPrivate !== undefined) updateData.isPrivate = validatedData.isPrivate;

    // Update the cookbook
    const updatedCookbook = await prisma.cookbook.update({
      where: { id: params.id },
      data: updateData,
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
      message: 'Cookbook updated successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error updating cookbook:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid cookbook data',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Delete the cookbook (cascade will handle relationships)
    await prisma.cookbook.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Cookbook deleted successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error deleting cookbook:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}