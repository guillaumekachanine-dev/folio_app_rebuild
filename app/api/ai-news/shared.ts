import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface AINewsArticle {
  title: string;
  category: 'business' | 'llm' | 'frontier' | 'youtube';
  source_name: string;
  source_url?: string;
  article_url: string;
  published_at?: string;
  selection_date?: string;
  rank?: number;
  summary?: string;
  featured_image_url?: string;
}

interface AINewsDigest {
  date: string;
  category: string;
  summary?: string;
  key_insights?: string[];
  articles_count?: number;
}

export async function handleAINewsGet(
  searchParams?: Record<string, string | string[]>
) {
  try {
    const supabase = await createClient();

    // Get category filter
    const category = (searchParams?.category as string) || null;

    // Get articles
    const articleQuery = supabase
      .from('ai_news_articles')
      .select('*')
      .order('selection_date', { ascending: false, nullsFirst: false })
      .order('rank', { ascending: true, nullsFirst: false })
      .order('published_at', { ascending: false, nullsFirst: false });

    if (category && category !== 'all') {
      articleQuery.eq('category', category);
    }

    const { data: articles, error: articlesError } = await articleQuery;

    if (articlesError) {
      console.error('[GET /api/ai-news] Error fetching articles:', articlesError);
      return NextResponse.json(
        { error: articlesError.message },
        { status: 500 }
      );
    }

    // Get digests
    const { data: digests, error: digestsError } = await supabase
      .from('ai_news_digests')
      .select('*')
      .order('date', { ascending: false });

    if (digestsError) {
      console.error('[GET /api/ai-news] Error fetching digests:', digestsError);
      return NextResponse.json(
        { error: digestsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      articles: articles || [],
      digests: digests || [],
    });
  } catch (error) {
    console.error('[GET /api/ai-news] Exception:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function handleAINewsPost(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();
    console.log('[POST /api/ai-news] Received payload:', {
      articles: body.articles?.length || 0,
      digests: body.digests?.length || 0,
    });

    // Validate and normalize articles
    if (body.articles && Array.isArray(body.articles)) {
      for (const article of body.articles) {
        if (!article.title || !article.source_name || !article.article_url) {
          return NextResponse.json(
            {
              error: 'Each article must have title, source_name, and article_url',
            },
            { status: 400 }
          );
        }
      }

      // Normalize category
      const normalizedArticles = body.articles.map(
        (article: AINewsArticle) => ({
          ...article,
          category: article.category || 'business',
          published_at: article.published_at || new Date().toISOString(),
          selection_date: article.selection_date || new Date().toISOString(),
          rank: article.rank || 999,
        })
      );

      // Upsert articles
      const { error: articlesError } = await supabase
        .from('ai_news_articles')
        .upsert(normalizedArticles, {
          onConflict: 'article_url',
        });

      if (articlesError) {
        console.error('[POST /api/ai-news] Error upserting articles:', articlesError);
        return NextResponse.json(
          { error: articlesError.message },
          { status: 500 }
        );
      }

      console.log(`[POST /api/ai-news] Upserted ${normalizedArticles.length} articles`);
    }

    // Validate and insert digests
    if (body.digests && Array.isArray(body.digests)) {
      for (const digest of body.digests) {
        if (!digest.date || !digest.category) {
          return NextResponse.json(
            { error: 'Each digest must have date and category' },
            { status: 400 }
          );
        }
      }

      const { error: digestsError } = await supabase
        .from('ai_news_digests')
        .upsert(body.digests, {
          onConflict: 'date,category',
        });

      if (digestsError) {
        console.error('[POST /api/ai-news] Error upserting digests:', digestsError);
        return NextResponse.json(
          { error: digestsError.message },
          { status: 500 }
        );
      }

      console.log(`[POST /api/ai-news] Upserted ${body.digests.length} digests`);
    }

    return NextResponse.json({
      success: true,
      articlesCount: body.articles?.length || 0,
      digestsCount: body.digests?.length || 0,
    });
  } catch (error) {
    console.error('[POST /api/ai-news] Exception:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
