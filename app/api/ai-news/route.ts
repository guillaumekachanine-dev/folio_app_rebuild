import { handleAINewsGet, handleAINewsPost, normalizeAINewsCategory } from './shared'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ category?: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  const params = (await context.params) ?? {}
  const routeCategory = (params as { category?: string }).category
  const queryCategory = req.nextUrl.searchParams.get('category')
  
  const category = normalizeAINewsCategory(routeCategory || queryCategory)

  if (!category) {
    return NextResponse.json({ error: 'Catégorie AI News invalide' }, { status: 404 })
  }

  return handleAINewsGet(category)
}

export async function POST(req: NextRequest, context: RouteContext) {
  const params = (await context.params) ?? {}
  const routeCategory = (params as { category?: string }).category
  const queryCategory = req.nextUrl.searchParams.get('category')
  
  const category = normalizeAINewsCategory(routeCategory || queryCategory)

  if (!category) {
    return NextResponse.json({ error: 'Catégorie AI News invalide' }, { status: 404 })
  }

  return handleAINewsPost(req, category)
}

