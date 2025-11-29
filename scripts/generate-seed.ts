import mysql from 'mysql2/promise';
import { writeFileSync } from 'fs';

const LEGACY_DB_CONFIG = {
  host: 'sponky.dougis.com',
  port: 3306,
  user: 'read_only',
  password: 'password',
  database: 'recipe_laravel',
};

interface LegacyData {
  classifications: any[];
  sources: any[];
  meals: any[];
  courses: any[];
  preparations: any[];
  recipes: any[];
  recipe_meals: any[];
  recipe_courses: any[];
  recipe_preparations: any[];
  cookbooks: any[];
  cookbook_recipes: any[];
}

async function fetchLegacyData(): Promise<LegacyData> {
  // First, connect without specifying database to list available databases
  const tempConnection = await mysql.createConnection({
    host: LEGACY_DB_CONFIG.host,
    port: LEGACY_DB_CONFIG.port,
    user: LEGACY_DB_CONFIG.user,
    password: LEGACY_DB_CONFIG.password,
  });

  try {
    const [databases] = await tempConnection.query('SHOW DATABASES');
    console.log('Available databases:', (databases as any[]).map((db: any) => db.Database));
  } finally {
    await tempConnection.end();
  }

  const connection = await mysql.createConnection(LEGACY_DB_CONFIG);

  const data: LegacyData = {
    classifications: [],
    sources: [],
    meals: [],
    courses: [],
    preparations: [],
    recipes: [],
    recipe_meals: [],
    recipe_courses: [],
    recipe_preparations: [],
    cookbooks: [],
    cookbook_recipes: [],
  };

  try {
    // Fetch all tables
    const [classifications] = await connection.query('SELECT * FROM classifications');
    const [sources] = await connection.query('SELECT * FROM sources');
    const [meals] = await connection.query('SELECT * FROM meals');
    const [courses] = await connection.query('SELECT * FROM courses');
    const [preparations] = await connection.query('SELECT * FROM preparations');
    const [recipes] = await connection.query('SELECT * FROM recipes');
    const [recipeMeals] = await connection.query('SELECT * FROM recipe_meals');
    const [recipeCourses] = await connection.query('SELECT * FROM recipe_courses');
    const [recipePreparations] = await connection.query('SELECT * FROM recipe_preparations');
    const [cookbooks] = await connection.query('SELECT * FROM cookbooks');
    const [cookbookRecipes] = await connection.query('SELECT * FROM cookbook_recipes');

    data.classifications = classifications as any[];
    data.sources = sources as any[];
    data.meals = meals as any[];
    data.courses = courses as any[];
    data.preparations = preparations as any[];
    data.recipes = (recipes as any[]).map((recipe: any) => ({
      ...recipe,
      marked: recipe.marked === 1 ? true : (recipe.marked === 0 ? false : null),
    }));
    data.recipe_meals = recipeMeals as any[];
    data.recipe_courses = recipeCourses as any[];
    data.recipe_preparations = recipePreparations as any[];
    data.cookbooks = cookbooks as any[];
    data.cookbook_recipes = cookbookRecipes as any[];

    console.log('✓ Classifications:', data.classifications.length);
    console.log('✓ Sources:', data.sources.length);
    console.log('✓ Meals:', data.meals.length);
    console.log('✓ Courses:', data.courses.length);
    console.log('✓ Preparations:', data.preparations.length);
    console.log('✓ Recipes:', data.recipes.length);
    console.log('✓ Recipe Meals:', data.recipe_meals.length);
    console.log('✓ Recipe Courses:', data.recipe_courses.length);
    console.log('✓ Recipe Preparations:', data.recipe_preparations.length);
    console.log('✓ Cookbooks:', data.cookbooks.length);
    console.log('✓ Cookbook Recipes:', data.cookbook_recipes.length);
  } finally {
    await connection.end();
  }

  return data;
}

function generateSeedCode(data: LegacyData): string {
  let code = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const legacyData = ${JSON.stringify(data, null, 2)};

async function main() {
  console.log('Starting database seed from legacy data...');

  try {
    // Seed classifications
    console.log('Seeding classifications...');
    for (const classification of legacyData.classifications) {
      await prisma.classification.upsert({
        where: { id: classification.id },
        update: { name: classification.name },
        create: {
          id: classification.id,
          name: classification.name,
          created_at: new Date(classification.created_at),
          updated_at: new Date(classification.updated_at),
        },
      });
    }

    // Seed sources
    console.log('Seeding sources...');
    for (const source of legacyData.sources) {
      await prisma.source.upsert({
        where: { id: source.id },
        update: { name: source.name },
        create: {
          id: source.id,
          name: source.name,
          created_at: new Date(source.created_at),
          updated_at: new Date(source.updated_at),
        },
      });
    }

    // Seed meals
    console.log('Seeding meals...');
    for (const meal of legacyData.meals) {
      await prisma.meal.upsert({
        where: { id: meal.id },
        update: { name: meal.name },
        create: {
          id: meal.id,
          name: meal.name,
          created_at: new Date(meal.created_at),
          updated_at: new Date(meal.updated_at),
        },
      });
    }

    // Seed courses
    console.log('Seeding courses...');
    for (const course of legacyData.courses) {
      await prisma.course.upsert({
        where: { id: course.id },
        update: { name: course.name },
        create: {
          id: course.id,
          name: course.name,
          created_at: new Date(course.created_at),
          updated_at: new Date(course.updated_at),
        },
      });
    }

    // Seed preparations
    console.log('Seeding preparations...');
    for (const preparation of legacyData.preparations) {
      await prisma.preparation.upsert({
        where: { id: preparation.id },
        update: { description: preparation.description },
        create: {
          id: preparation.id,
          description: preparation.description,
          created_at: new Date(preparation.created_at),
          updated_at: new Date(preparation.updated_at),
        },
      });
    }

    // Seed recipes
    console.log('Seeding recipes...');
    for (const recipe of legacyData.recipes) {
      await prisma.recipe.upsert({
        where: { id: recipe.id },
        update: {
          name: recipe.name,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          notes: recipe.notes,
          servings: recipe.servings,
          source_id: recipe.source_id,
          classification_id: recipe.classification_id,
          date_added: recipe.date_added ? new Date(recipe.date_added) : null,
          calories: recipe.calories,
          fat: recipe.fat,
          cholesterol: recipe.cholesterol,
          sodium: recipe.sodium,
          protein: recipe.protein,
          marked: recipe.marked,
        },
        create: {
          id: recipe.id,
          name: recipe.name,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          notes: recipe.notes,
          servings: recipe.servings,
          source_id: recipe.source_id,
          classification_id: recipe.classification_id,
          date_added: recipe.date_added ? new Date(recipe.date_added) : null,
          calories: recipe.calories,
          fat: recipe.fat,
          cholesterol: recipe.cholesterol,
          sodium: recipe.sodium,
          protein: recipe.protein,
          marked: recipe.marked,
          created_at: new Date(recipe.created_at),
          updated_at: new Date(recipe.updated_at),
        },
      });
    }

    // Seed cookbooks
    console.log('Seeding cookbooks...');
    for (const cookbook of legacyData.cookbooks) {
      await prisma.cookbook.upsert({
        where: { id: cookbook.id },
        update: { name: cookbook.name },
        create: {
          id: cookbook.id,
          name: cookbook.name,
          created_at: new Date(cookbook.created_at),
          updated_at: new Date(cookbook.updated_at),
        },
      });
    }

    // Seed recipe relationships
    console.log('Seeding recipe meal relationships...');
    for (const recipeMeal of legacyData.recipe_meals) {
      await prisma.recipeMeal.upsert({
        where: { id: recipeMeal.id },
        update: {},
        create: {
          id: recipeMeal.id,
          recipe_id: recipeMeal.recipe_id,
          meal_id: recipeMeal.meal_id,
          created_at: new Date(recipeMeal.created_at),
          updated_at: new Date(recipeMeal.updated_at),
        },
      });
    }

    console.log('Seeding recipe course relationships...');
    for (const recipeCourse of legacyData.recipe_courses) {
      await prisma.recipeCourse.upsert({
        where: { id: recipeCourse.id },
        update: {},
        create: {
          id: recipeCourse.id,
          recipe_id: recipeCourse.recipe_id,
          course_id: recipeCourse.course_id,
          created_at: new Date(recipeCourse.created_at),
          updated_at: new Date(recipeCourse.updated_at),
        },
      });
    }

    console.log('Seeding recipe preparation relationships...');
    for (const recipePreparation of legacyData.recipe_preparations) {
      await prisma.recipePreparation.upsert({
        where: { id: recipePreparation.id },
        update: {},
        create: {
          id: recipePreparation.id,
          recipe_id: recipePreparation.recipe_id,
          preparation_id: recipePreparation.preparation_id,
          created_at: new Date(recipePreparation.created_at),
          updated_at: new Date(recipePreparation.updated_at),
        },
      });
    }

    // Seed cookbook-recipe relationships
    console.log('Seeding cookbook recipe relationships...');
    for (const cookbookRecipe of legacyData.cookbook_recipes) {
      await prisma.cookbookRecipe.upsert({
        where: { id: cookbookRecipe.id },
        update: {},
        create: {
          id: cookbookRecipe.id,
          cookbook_id: cookbookRecipe.cookbook_id,
          recipe_id: cookbookRecipe.recipe_id,
          created_at: new Date(cookbookRecipe.created_at),
          updated_at: new Date(cookbookRecipe.updated_at),
        },
      });
    }

    console.log('✓ Database seed completed successfully!');
  } catch (error) {
    console.error('✗ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;

  return code;
}

async function main() {
  console.log('Fetching legacy database data...\n');
  const data = await fetchLegacyData();

  console.log('\nGenerating seed file...');
  const seedCode = generateSeedCode(data);
  
  writeFileSync('prisma/seed.ts', seedCode);
  console.log('✓ Generated prisma/seed.ts');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
