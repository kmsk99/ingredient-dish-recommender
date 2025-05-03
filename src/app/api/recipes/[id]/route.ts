import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // ID로 직접 레시피 조회
    const { data, error } = await supabase
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
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('레시피 조회 오류:', error);
      return NextResponse.json(
        { error: '해당 레시피를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { error: '해당 레시피를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 데이터 구조 변환
    const recipe = {
      ...data,
      ingredients: data.recipe_ingredients.map((ri: { ingredient: { name: string } }) => ri.ingredient.name)
    };
    
    return NextResponse.json(recipe);
  } catch (error) {
    console.error('API 라우트: 레시피를 가져오는 중 오류 발생:', error);
    return NextResponse.json(
      { error: '레시피를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 