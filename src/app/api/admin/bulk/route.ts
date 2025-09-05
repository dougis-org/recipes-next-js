import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Bulk operation schemas
const bulkDeleteSchema = z.object({
  action: z.literal('delete'),
  entity: z.enum(['recipes', 'cookbooks', 'users', 'classifications', 'sources', 'meals', 'courses', 'preparations']),
  ids: z.array(z.string()).min(1, 'At least one ID is required'),
});

const bulkUpdateSchema = z.object({
  action: z.literal('update'),
  entity: z.enum(['recipes', 'cookbooks', 'users']),
  ids: z.array(z.string()).min(1, 'At least one ID is required'),
  data: z.record(z.union([z.string(), z.number(), z.boolean()])),
});

const bulkSchema = z.union([bulkDeleteSchema, bulkUpdateSchema]);

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here when auth is implemented
    // For now, this is open but should be protected in production

    const body = await request.json();
    const validatedData = bulkSchema.parse(body);

    let result: any = {};
    let message = '';

    if (validatedData.action === 'delete') {
      switch (validatedData.entity) {
        case 'recipes':
          const deletedRecipes = await prisma.recipe.deleteMany({
            where: { id: { in: validatedData.ids } }
          });
          result = { deleted_count: deletedRecipes.count };
          message = `Deleted ${deletedRecipes.count} recipes`;
          break;

        case 'cookbooks':
          const deletedCookbooks = await prisma.cookbook.deleteMany({
            where: { id: { in: validatedData.ids } }
          });
          result = { deleted_count: deletedCookbooks.count };
          message = `Deleted ${deletedCookbooks.count} cookbooks`;
          break;

        case 'users':
          // Check if any users have recipes or cookbooks
          const usersWithContent = await prisma.user.findMany({
            where: { 
              id: { in: validatedData.ids },
              OR: [
                { recipes: { some: {} } },
                { cookbooks: { some: {} } }
              ]
            },
            select: {
              id: true,
              name: true,
              _count: {
                select: {
                  recipes: true,
                  cookbooks: true
                }
              }
            }
          });

          if (usersWithContent.length > 0) {
            return NextResponse.json({
              success: false,
              message: 'Cannot delete users with existing content',
              data: {
                users_with_content: usersWithContent.map(u => ({
                  id: u.id,
                  name: u.name,
                  recipes: u._count.recipes,
                  cookbooks: u._count.cookbooks
                }))
              }
            }, { status: 400 });
          }

          const deletedUsers = await prisma.user.deleteMany({
            where: { id: { in: validatedData.ids } }
          });
          result = { deleted_count: deletedUsers.count };
          message = `Deleted ${deletedUsers.count} users`;
          break;

        case 'classifications':
          // Check if any classifications are in use
          const classificationsInUse = await prisma.classification.findMany({
            where: { 
              id: { in: validatedData.ids },
              recipes: { some: {} }
            },
            select: {
              id: true,
              name: true,
              _count: {
                select: { recipes: true }
              }
            }
          });

          if (classificationsInUse.length > 0) {
            return NextResponse.json({
              success: false,
              message: 'Cannot delete classifications in use',
              data: {
                classifications_in_use: classificationsInUse.map(c => ({
                  id: c.id,
                  name: c.name,
                  recipes: c._count.recipes
                }))
              }
            }, { status: 400 });
          }

          const deletedClassifications = await prisma.classification.deleteMany({
            where: { id: { in: validatedData.ids } }
          });
          result = { deleted_count: deletedClassifications.count };
          message = `Deleted ${deletedClassifications.count} classifications`;
          break;

        default:
          // Handle other metadata entities similarly
          const model = getModelByEntity(validatedData.entity);
          if (model) {
            const deleted = await (prisma as any)[model].deleteMany({
              where: { id: { in: validatedData.ids } }
            });
            result = { deleted_count: deleted.count };
            message = `Deleted ${deleted.count} ${validatedData.entity}`;
          }
      }
    } else if (validatedData.action === 'update') {
      switch (validatedData.entity) {
        case 'recipes':
          const updatedRecipes = await prisma.recipe.updateMany({
            where: { id: { in: validatedData.ids } },
            data: validatedData.data
          });
          result = { updated_count: updatedRecipes.count };
          message = `Updated ${updatedRecipes.count} recipes`;
          break;

        case 'cookbooks':
          const updatedCookbooks = await prisma.cookbook.updateMany({
            where: { id: { in: validatedData.ids } },
            data: validatedData.data
          });
          result = { updated_count: updatedCookbooks.count };
          message = `Updated ${updatedCookbooks.count} cookbooks`;
          break;

        case 'users':
          const updatedUsers = await prisma.user.updateMany({
            where: { id: { in: validatedData.ids } },
            data: validatedData.data
          });
          result = { updated_count: updatedUsers.count };
          message = `Updated ${updatedUsers.count} users`;
          break;
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      message,
      meta: {
        api_version: 'v1'
      }
    });

  } catch (error) {
    console.error('Error performing bulk operation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid bulk operation data',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

function getModelByEntity(entity: string): string | null {
  const entityModelMap: Record<string, string> = {
    sources: 'source',
    meals: 'meal',
    courses: 'course',
    preparations: 'preparation',
  };
  return entityModelMap[entity] || null;
}