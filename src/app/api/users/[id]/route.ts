import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { userUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
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

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

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
      message: 'User retrieved successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error fetching user:', error);
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
    const validatedData = userUpdateSchema.parse({ ...body, id: params.id });

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Check if email is being changed and if it already exists
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });

      if (emailExists) {
        return NextResponse.json({
          success: false,
          message: 'User with this email already exists'
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.email !== undefined) updateData.email = validatedData.email;
    if (validatedData.subscriptionTier !== undefined) updateData.subscriptionTier = validatedData.subscriptionTier;
    if (validatedData.subscriptionStatus !== undefined) updateData.subscriptionStatus = validatedData.subscriptionStatus;
    if (validatedData.adminOverride !== undefined) updateData.adminOverride = validatedData.adminOverride;

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      subscription_tier: updatedUser.subscriptionTier,
      subscription_status: updatedUser.subscriptionStatus,
      admin_override: updatedUser.adminOverride,
      created_at: updatedUser.createdAt.toISOString(),
      updated_at: updatedUser.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: transformedUser,
      message: 'User updated successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Check if user has recipes or cookbooks
    const recipesCount = await prisma.recipe.count({
      where: { userId: params.id }
    });
    
    const cookbooksCount = await prisma.cookbook.count({
      where: { userId: params.id }
    });

    if (recipesCount > 0 || cookbooksCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete user. They have ${recipesCount} recipe(s) and ${cookbooksCount} cookbook(s). Please reassign or delete their content first.`
      }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}