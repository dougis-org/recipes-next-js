import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { metadataUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!course) {
      return NextResponse.json({
        success: false,
        message: 'Course not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: course,
      message: 'Course retrieved successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error fetching course:', error);
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

    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id }
    });

    if (!existingCourse) {
      return NextResponse.json({
        success: false,
        message: 'Course not found'
      }, { status: 404 });
    }

    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;

    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: 'Course updated successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error updating course:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid course data',
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
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id }
    });

    if (!existingCourse) {
      return NextResponse.json({
        success: false,
        message: 'Course not found'
      }, { status: 404 });
    }

    const recipesUsingCourse = await prisma.recipeCourse.count({
      where: { courseId: params.id }
    });

    if (recipesUsingCourse > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete course. It is being used by ${recipesUsingCourse} recipe(s).`
      }, { status: 400 });
    }

    await prisma.course.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}