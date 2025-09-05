import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { userCreateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    // Build where clause for search
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        adminOverride: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit,
    });

    // Transform to match Laravel API format
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      subscription_tier: user.subscriptionTier,
      subscription_status: user.subscriptionStatus,
      admin_override: user.adminOverride,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: transformedUsers,
      message: 'Users retrieved successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = userCreateSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists'
      }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        subscriptionTier: validatedData.subscriptionTier,
        subscriptionStatus: validatedData.subscriptionStatus,
        adminOverride: validatedData.adminOverride,
      },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        adminOverride: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Transform to match Laravel API format
    const transformedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      subscription_tier: user.subscriptionTier,
      subscription_status: user.subscriptionStatus,
      admin_override: user.adminOverride,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: transformedUser,
      message: 'User created successfully',
      meta: {
        api_version: 'v1'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid user data',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}