import { NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

// 타입 정의
interface RecipeIngredient {
  ingredient: {
    id: string;
    name: string;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const materialCategory = searchParams.get('materialCategory');
    const kind = searchParams.get('kind');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients!inner (
          ingredient:ingredients (
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (materialCategory) {
      query = query.eq('material_category', materialCategory);
    }

    if (kind) {
      query = query.eq('kind', kind);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 데이터 구조 변환
    const transformedData = data.map(recipe => ({
      ...recipe,
      ingredients: recipe.recipe_ingredients.map((ri: RecipeIngredient) => ri.ingredient)
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const recipe = await request.json();
    
    // 1. 레시피 생성
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        id: recipe.id,
        title: recipe.title,
        short_title: recipe.shortTitle,
        register_id: recipe.registerId,
        register_name: recipe.registerName,
        view_count: recipe.viewCount,
        recommend_count: recipe.recommendCount,
        scrap_count: recipe.scrapCount,
        method: recipe.method,
        situation: recipe.situation,
        material_category: recipe.materialCategory,
        kind: recipe.kind,
        description: recipe.description,
        raw_ingredients: recipe.rawIngredients,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        time: recipe.time,
        first_register_date: recipe.firstRegisterDate,
        image_url: recipe.image_url
      })
      .select()
      .single();

    if (recipeError) {
      return NextResponse.json({ error: recipeError.message }, { status: 500 });
    }

    // 2. 재료 처리
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      // 2.1. 재료가 이미 존재하는지 확인하고, 없는 재료는 생성
      const ingredientNames = recipe.ingredients.map((name: string) => name.trim());
      
      // 2.2. 재료 조회
      const { data: existingIngredients, error: existingError } = await supabase
        .from('ingredients')
        .select('id, name')
        .in('name', ingredientNames);

      if (existingError) {
        return NextResponse.json({ error: existingError.message }, { status: 500 });
      }

      // 2.3. 없는 재료 생성
      const existingNames = new Set(existingIngredients.map(i => i.name));
      const newIngredients = ingredientNames.filter((name: string) => !existingNames.has(name));
      
      if (newIngredients.length > 0) {
        const { error: insertError } = await supabase
          .from('ingredients')
          .insert(newIngredients.map((name: string) => ({ name })));

        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
      }

      // 2.4. 모든 재료 다시 조회
      const { data: allIngredients, error: allError } = await supabase
        .from('ingredients')
        .select('id, name')
        .in('name', ingredientNames);

      if (allError) {
        return NextResponse.json({ error: allError.message }, { status: 500 });
      }

      // 2.5. 레시피-재료 관계 생성
      const recipeIngredients = allIngredients.map(ingredient => ({
        recipe_id: recipe.id,
        ingredient_id: ingredient.id
      }));

      const { error: relationError } = await supabase
        .from('recipe_ingredients')
        .insert(recipeIngredients);

      if (relationError) {
        return NextResponse.json({ error: relationError.message }, { status: 500 });
      }
    }

    return NextResponse.json(recipeData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 