import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { metadataUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const preparation = await prisma.preparation.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!preparation) {
      return NextResponse.json({
        success: false,
        message: 'Preparation not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: preparation,
      message: 'Preparation retrieved successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error fetching preparation:', error);
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

    const existingPreparation = await prisma.preparation.findUnique({
      where: { id: params.id }
    });

    if (!existingPreparation) {
      return NextResponse.json({
        success: false,
        message: 'Preparation not found'
      }, { status: 404 });
    }

    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;

    const updatedPreparation = await prisma.preparation.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedPreparation,
      message: 'Preparation updated successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error updating preparation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid preparation data',
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
    const existingPreparation = await prisma.preparation.findUnique({
      where: { id: params.id }
    });

    if (!existingPreparation) {
      return NextResponse.json({
        success: false,
        message: 'Preparation not found'
      }, { status: 404 });
    }

    const recipesUsingPreparation = await prisma.recipePreparation.count({
      where: { preparationId: params.id }
    });

    if (recipesUsingPreparation > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete preparation. It is being used by ${recipesUsingPreparation} recipe(s).`
      }, { status: 400 });
    }

    await prisma.preparation.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Preparation deleted successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error deleting preparation:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}