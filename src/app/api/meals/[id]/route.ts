import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { metadataUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meal = await prisma.meal.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!meal) {
      return NextResponse.json({
        success: false,
        message: 'Meal not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: meal,
      message: 'Meal retrieved successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error fetching meal:', error);
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
    const validatedData = metadataUpdateSchema.parse({ ...body, id: params.id });

    const existingMeal = await prisma.meal.findUnique({
      where: { id: params.id }
    });

    if (!existingMeal) {
      return NextResponse.json({
        success: false,
        message: 'Meal not found'
      }, { status: 404 });
    }

    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;

    const updatedMeal = await prisma.meal.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedMeal,
      message: 'Meal updated successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error updating meal:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid meal data',
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
    const existingMeal = await prisma.meal.findUnique({
      where: { id: params.id }
    });

    if (!existingMeal) {
      return NextResponse.json({
        success: false,
        message: 'Meal not found'
      }, { status: 404 });
    }

    const recipesUsingMeal = await prisma.recipeMeal.count({
      where: { mealId: params.id }
    });

    if (recipesUsingMeal > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete meal. It is being used by ${recipesUsingMeal} recipe(s).`
      }, { status: 400 });
    }

    await prisma.meal.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Meal deleted successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error deleting meal:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}