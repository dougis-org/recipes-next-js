import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookbookCreateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: Record<string, string | boolean | number | undefined> = {};
    if (userId) {
      where.userId = userId;
    }

    const cookbooks = await prisma.cookbook.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit,
    });

    // Transform the data to match the frontend types
    const transformedCookbooks = cookbooks.map(cookbook => ({
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
        meal_ids: [], // Would need additional queries for full recipe data
        preparation_ids: [],
        course_ids: [],
        is_private: r.recipe.isPrivate,
        created_at: r.recipe.createdAt.toISOString(),
        updated_at: r.recipe.updatedAt.toISOString(),
        user: r.recipe.user,
        source: r.recipe.source,
        classification: r.recipe.classification,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: transformedCookbooks,
      message: 'Cookbooks retrieved successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error fetching cookbooks:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = cookbookCreateSchema.parse(body);

    const cookbook = await prisma.cookbook.create({
      data: {
        userId: validatedData.userId,
        name: validatedData.name,
        description: validatedData.description,
        coverImage: validatedData.coverImage,
        isPrivate: validatedData.isPrivate,
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
            recipe: true
          },
          orderBy: {
            order: 'asc'
          }
        },
      },
    });

    // Transform the data
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
      recipes: [],
    };

    return NextResponse.json({
      success: true,
      data: transformedCookbook,
      message: 'Cookbook created successfully',
      meta: {
        api_version: 'v1'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating cookbook:', error);
    
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