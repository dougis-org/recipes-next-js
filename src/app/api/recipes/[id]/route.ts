import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recipeUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipe = await prisma.recipe.findUnique({
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
    });

    if (!recipe) {
      return NextResponse.json({
        success: false,
        message: 'Recipe not found'
      }, { status: 404 });
    }

    // Transform the data to match the frontend types
    const transformedRecipe = {
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
    };

    return NextResponse.json({
      success: true,
      data: transformedRecipe,
      message: 'Recipe retrieved successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error fetching recipe:', error);
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
    const validatedData = recipeUpdateSchema.parse({ ...body, id: params.id });

    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: params.id }
    });

    if (!existingRecipe) {
      return NextResponse.json({
        success: false,
        message: 'Recipe not found'
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.ingredients !== undefined) updateData.ingredients = validatedData.ingredients;
    if (validatedData.instructions !== undefined) updateData.instructions = validatedData.instructions;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
    if (validatedData.servings !== undefined) updateData.servings = validatedData.servings;
    if (validatedData.sourceId !== undefined) updateData.sourceId = validatedData.sourceId;
    if (validatedData.classificationId !== undefined) updateData.classificationId = validatedData.classificationId;
    if (validatedData.calories !== undefined) updateData.calories = validatedData.calories;
    if (validatedData.fat !== undefined) updateData.fat = validatedData.fat;
    if (validatedData.cholesterol !== undefined) updateData.cholesterol = validatedData.cholesterol;
    if (validatedData.sodium !== undefined) updateData.sodium = validatedData.sodium;
    if (validatedData.protein !== undefined) updateData.protein = validatedData.protein;
    if (validatedData.marked !== undefined) updateData.marked = validatedData.marked;
    if (validatedData.isPrivate !== undefined) updateData.isPrivate = validatedData.isPrivate;
    if (validatedData.tags !== undefined) updateData.tags = JSON.stringify(validatedData.tags);

    // Update the recipe
    const updatedRecipe = await prisma.recipe.update({
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
    });

    // Update many-to-many relationships if provided
    if (validatedData.mealIds !== undefined) {
      // Delete existing relationships
      await prisma.recipeMeal.deleteMany({
        where: { recipeId: params.id }
      });
      
      // Create new relationships
      if (validatedData.mealIds.length > 0) {
        await prisma.recipeMeal.createMany({
          data: validatedData.mealIds.map(mealId => ({
            recipeId: params.id,
            mealId,
          })),
        });
      }
    }

    if (validatedData.courseIds !== undefined) {
      await prisma.recipeCourse.deleteMany({
        where: { recipeId: params.id }
      });
      
      if (validatedData.courseIds.length > 0) {
        await prisma.recipeCourse.createMany({
          data: validatedData.courseIds.map(courseId => ({
            recipeId: params.id,
            courseId,
          })),
        });
      }
    }

    if (validatedData.preparationIds !== undefined) {
      await prisma.recipePreparation.deleteMany({
        where: { recipeId: params.id }
      });
      
      if (validatedData.preparationIds.length > 0) {
        await prisma.recipePreparation.createMany({
          data: validatedData.preparationIds.map(preparationId => ({
            recipeId: params.id,
            preparationId,
          })),
        });
      }
    }

    // Fetch the updated recipe with all relations
    const completeRecipe = await prisma.recipe.findUnique({
      where: { id: params.id },
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
    });

    if (!completeRecipe) {
      return NextResponse.json({
        success: false,
        message: 'Recipe updated but could not be retrieved'
      }, { status: 500 });
    }

    // Transform the data
    const transformedRecipe = {
      id: completeRecipe.id,
      user_id: completeRecipe.userId,
      name: completeRecipe.name,
      ingredients: completeRecipe.ingredients,
      instructions: completeRecipe.instructions,
      notes: completeRecipe.notes,
      servings: completeRecipe.servings,
      source_id: completeRecipe.sourceId,
      classification_id: completeRecipe.classificationId,
      date_added: completeRecipe.dateAdded.toISOString(),
      calories: completeRecipe.calories,
      fat: completeRecipe.fat,
      cholesterol: completeRecipe.cholesterol,
      sodium: completeRecipe.sodium,
      protein: completeRecipe.protein,
      marked: completeRecipe.marked,
      tags: completeRecipe.tags ? JSON.parse(completeRecipe.tags) : [],
      meal_ids: completeRecipe.meals.map(m => m.mealId),
      preparation_ids: completeRecipe.preparations.map(p => p.preparationId),
      course_ids: completeRecipe.courses.map(c => c.courseId),
      is_private: completeRecipe.isPrivate,
      created_at: completeRecipe.createdAt.toISOString(),
      updated_at: completeRecipe.updatedAt.toISOString(),
      user: completeRecipe.user,
      source: completeRecipe.source,
      classification: completeRecipe.classification,
      meals: completeRecipe.meals.map(m => m.meal),
      courses: completeRecipe.courses.map(c => c.course),
      preparations: completeRecipe.preparations.map(p => p.preparation),
    };

    return NextResponse.json({
      success: true,
      data: transformedRecipe,
      message: 'Recipe updated successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error updating recipe:', error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: params.id }
    });

    if (!existingRecipe) {
      return NextResponse.json({
        success: false,
        message: 'Recipe not found'
      }, { status: 404 });
    }

    // Delete the recipe (cascade will handle relationships)
    await prisma.recipe.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Recipe deleted successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}