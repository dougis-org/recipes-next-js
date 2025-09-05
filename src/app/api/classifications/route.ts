import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { metadataCreateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const classifications = await prisma.classification.findMany({
      orderBy: {
        name: 'asc'
      },
      skip: offset,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: classifications,
      message: 'Classifications retrieved successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error fetching classifications:', error);
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

    const classification = await prisma.classification.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
      },
    });

    return NextResponse.json({
      success: true,
      data: classification,
      message: 'Classification created successfully',
      meta: {
        api_version: 'v1'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating classification:', error);
    
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