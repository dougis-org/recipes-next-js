import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { searchSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      query: searchParams.get('q') || searchParams.get('query') || '',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const validatedParams = searchSchema.parse(params);

    // Build comprehensive search where clause
    const where: any = {
      isPrivate: false, // Only search public recipes
      OR: [
        { name: { contains: validatedParams.query, mode: 'insensitive' } },
        { ingredients: { contains: validatedParams.query, mode: 'insensitive' } },
        { instructions: { contains: validatedParams.query, mode: 'insensitive' } },
        { tags: { contains: validatedParams.query, mode: 'insensitive' } },
        {
          user: {
            name: { contains: validatedParams.query, mode: 'insensitive' }
          }
        },
        {
          source: {
            name: { contains: validatedParams.query, mode: 'insensitive' }
          }
        },
        {
          classification: {
            name: { contains: validatedParams.query, mode: 'insensitive' }
          }
        },
      ]
    };

    const recipes = await prisma.recipe.findMany({
      where,
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
        meals: {
          include: {
            meal: true
          }
        },
        courses: {
          include: {
            course: true
          }
        },
        preparations: {
          include: {
            preparation: true
          }
        },
      },
      orderBy: [
        // Prioritize name matches first
        {
          name: 'asc'
        },
        {
          createdAt: 'desc'
        }
      ],
      skip: validatedParams.offset,
      take: validatedParams.limit,
    });

    // Transform the data to match the frontend types
    const transformedRecipes = recipes.map(recipe => ({
      id: recipe.id,
      user_id: recipe.userId,
      name: recipe.name,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      notes: recipe.notes,
      servings: recipe.servings,
      source_id: recipe.sourceId,
      classification_id: recipe.classificationId,
      date_added: recipe.dateAdded.toISOString(),
      calories: recipe.calories,
      fat: recipe.fat,
      cholesterol: recipe.cholesterol,
      sodium: recipe.sodium,
      protein: recipe.protein,
      marked: recipe.marked,
      tags: recipe.tags ? JSON.parse(recipe.tags) : [],
      meal_ids: recipe.meals.map(m => m.mealId),
      preparation_ids: recipe.preparations.map(p => p.preparationId),
      course_ids: recipe.courses.map(c => c.courseId),
      is_private: recipe.isPrivate,
      created_at: recipe.createdAt.toISOString(),
      updated_at: recipe.updatedAt.toISOString(),
      user: recipe.user,
      source: recipe.source,
      classification: recipe.classification,
      meals: recipe.meals.map(m => m.meal),
      courses: recipe.courses.map(c => c.course),
      preparations: recipe.preparations.map(p => p.preparation),
    }));

    return NextResponse.json({
      success: true,
      data: transformedRecipes,
      message: `Found ${transformedRecipes.length} recipes matching "${validatedParams.query}"`,
      meta: {
        api_version: 'v1',
        search_query: validatedParams.query,
        total_results: transformedRecipes.length
      }
    });

  } catch (error) {
    console.error('Error searching recipes:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid search parameters',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}