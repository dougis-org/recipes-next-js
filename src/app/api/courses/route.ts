import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { metadataCreateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const courses = await prisma.course.findMany({
      orderBy: {
        name: 'asc'
      },
      skip: offset,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: courses,
      message: 'Courses retrieved successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = metadataCreateSchema.parse(body);

    const course = await prisma.course.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
      },
    });

    return NextResponse.json({
      success: true,
      data: course,
      message: 'Course created successfully',
      meta: {
        api_version: 'v1'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating course:', error);
    
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