import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { metadataUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const source = await prisma.source.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!source) {
      return NextResponse.json({
        success: false,
        message: 'Source not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: source,
      message: 'Source retrieved successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error fetching source:', error);
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

    // Check if source exists
    const existingSource = await prisma.source.findUnique({
      where: { id: params.id }
    });

    if (!existingSource) {
      return NextResponse.json({
        success: false,
        message: 'Source not found'
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;

    const updatedSource = await prisma.source.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedSource,
      message: 'Source updated successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error updating source:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid source data',
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
    // Check if source exists
    const existingSource = await prisma.source.findUnique({
      where: { id: params.id }
    });

    if (!existingSource) {
      return NextResponse.json({
        success: false,
        message: 'Source not found'
      }, { status: 404 });
    }

    // Check if source is being used by any recipes
    const recipesUsingSource = await prisma.recipe.count({
      where: { sourceId: params.id }
    });

    if (recipesUsingSource > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete source. It is being used by ${recipesUsingSource} recipe(s).`
      }, { status: 400 });
    }

    await prisma.source.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Source deleted successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error deleting source:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}