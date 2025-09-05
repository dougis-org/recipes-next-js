import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recipeQuerySchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const params = {
      query: searchParams.get('query') || undefined,
      classificationId: searchParams.get('classificationId') || undefined,
      sourceId: searchParams.get('sourceId') || undefined,
      mealIds: searchParams.get('mealIds')?.split(',') || undefined,
      courseIds: searchParams.get('courseIds')?.split(',') || undefined,
      preparationIds: searchParams.get('preparationIds')?.split(',') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const validatedParams = recipeQuerySchema.parse(params);

    // Build where clause - only public recipes
    const where: any = {
      isPrivate: false, // Only public recipes
    };
    
    if (validatedParams.classificationId) {
      where.classificationId = validatedParams.classificationId;
    }
    
    if (validatedParams.sourceId) {
      where.sourceId = validatedParams.sourceId;
    }

    // Text search in name, ingredients, or instructions
    if (validatedParams.query) {
      where.OR = [
        { name: { contains: validatedParams.query } },
        { ingredients: { contains: validatedParams.query } },
        { instructions: { contains: validatedParams.query } },
      ];
    }

    // Tag search
    if (validatedParams.tags && validatedParams.tags.length > 0) {
      where.OR = where.OR || [];
      validatedParams.tags.forEach(tag => {
        where.OR.push({ tags: { contains: tag } });
      });
    }

    // Many-to-many filters
    if (validatedParams.mealIds && validatedParams.mealIds.length > 0) {
      where.meals = {
        some: {
          mealId: { in: validatedParams.mealIds }
        }
      };
    }

    if (validatedParams.courseIds && validatedParams.courseIds.length > 0) {
      where.courses = {
        some: {
          courseId: { in: validatedParams.courseIds }
        }
      };
    }

    if (validatedParams.preparationIds && validatedParams.preparationIds.length > 0) {
      where.preparations = {
        some: {
          preparationId: { in: validatedParams.preparationIds }
        }
      };
    }

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
      orderBy: {
        createdAt: 'desc'
      },
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
      message: 'Public recipes retrieved successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error fetching public recipes:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}