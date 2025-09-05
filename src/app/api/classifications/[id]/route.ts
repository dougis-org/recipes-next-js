import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { metadataUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classification = await prisma.classification.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!classification) {
      return NextResponse.json({
        success: false,
        message: 'Classification not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: classification,
      message: 'Classification retrieved successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error fetching classification:', error);
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

    // Check if classification exists
    const existingClassification = await prisma.classification.findUnique({
      where: { id: params.id }
    });

    if (!existingClassification) {
      return NextResponse.json({
        success: false,
        message: 'Classification not found'
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;

    const updatedClassification = await prisma.classification.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedClassification,
      message: 'Classification updated successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error updating classification:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid classification data',
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
    // Check if classification exists
    const existingClassification = await prisma.classification.findUnique({
      where: { id: params.id }
    });

    if (!existingClassification) {
      return NextResponse.json({
        success: false,
        message: 'Classification not found'
      }, { status: 404 });
    }

    // Check if classification is being used by any recipes
    const recipesUsingClassification = await prisma.recipe.count({
      where: { classificationId: params.id }
    });

    if (recipesUsingClassification > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete classification. It is being used by ${recipesUsingClassification} recipe(s).`
      }, { status: 400 });
    }

    await prisma.classification.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Classification deleted successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error deleting classification:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}