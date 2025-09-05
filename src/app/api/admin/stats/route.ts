import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here when auth is implemented
    // For now, this is open but should be protected in production

    // Get counts for all major entities
    const [
      totalUsers,
      totalRecipes,
      totalCookbooks,
      totalClassifications,
      totalSources,
      totalMeals,
      totalCourses,
      totalPreparations,
      publicRecipes,
      privateRecipes,
      publicCookbooks,
      privateCookbooks,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.recipe.count(),
      prisma.cookbook.count(),
      prisma.classification.count(),
      prisma.source.count(),
      prisma.meal.count(),
      prisma.course.count(),
      prisma.preparation.count(),
      prisma.recipe.count({ where: { isPrivate: false } }),
      prisma.recipe.count({ where: { isPrivate: true } }),
      prisma.cookbook.count({ where: { isPrivate: false } }),
      prisma.cookbook.count({ where: { isPrivate: true } }),
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      recentUsers,
      recentRecipes,
      recentCookbooks,
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.recipe.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.cookbook.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    // Get top users by recipe count
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            recipes: true,
            cookbooks: true,
          }
        }
      },
      orderBy: {
        recipes: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Get most used classifications
    const topClassifications = await prisma.classification.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            recipes: true
          }
        }
      },
      orderBy: {
        recipes: {
          _count: 'desc'
        }
      },
      take: 10
    });

    const stats = {
      overview: {
        total_users: totalUsers,
        total_recipes: totalRecipes,
        total_cookbooks: totalCookbooks,
        total_classifications: totalClassifications,
        total_sources: totalSources,
        total_meals: totalMeals,
        total_courses: totalCourses,
        total_preparations: totalPreparations,
      },
      privacy: {
        public_recipes: publicRecipes,
        private_recipes: privateRecipes,
        public_cookbooks: publicCookbooks,
        private_cookbooks: privateCookbooks,
      },
      recent_activity: {
        new_users_30d: recentUsers,
        new_recipes_30d: recentRecipes,
        new_cookbooks_30d: recentCookbooks,
      },
      top_users: topUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        recipe_count: user._count.recipes,
        cookbook_count: user._count.cookbooks,
      })),
      top_classifications: topClassifications.map(classification => ({
        id: classification.id,
        name: classification.name,
        recipe_count: classification._count.recipes,
      })),
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Admin stats retrieved successfully',
      meta: {
        api_version: 'v1',
        generated_at: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}