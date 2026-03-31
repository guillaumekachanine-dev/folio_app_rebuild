import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const today = new Date().toISOString().split('T')[0];

    // Create sample digest
    const digestData = {
      date: today,
      category: 'business',
      content: 'Key AI developments today - latest news from the industry',
      article_count: 3,
      summary: 'Key AI developments today',
      key_insights: [
        'AI adoption in enterprise accelerating',
        'New transformer architectures emerging',
        'Regulatory focus on safety',
      ],
    };

    const { error: digestError } = await supabase
      .from('ai_news_digests')
      .upsert([digestData], {
        onConflict: 'date,category',
      });

    if (digestError) {
      console.error('Error creating digest:', digestError);
      return NextResponse.json({ error: digestError.message }, { status: 500 });
    }

    // Create sample articles
    const articlesData = [
      {
        title: 'OpenAI releases new capabilities',
        category: 'llm',
        source_name: 'OpenAI Blog',
        source_url: 'https://openai.com',
        article_url: 'https://openai.com/news/1',
        published_at: new Date().toISOString(),
        selection_date: today,
        rank: 1,
        summary: 'New features for enterprise customers',
      },
      {
        title: 'Google advances AI research',
        category: 'frontier',
        source_name: 'Google Research',
        source_url: 'https://research.google.com',
        article_url: 'https://research.google.com/news/1',
        published_at: new Date().toISOString(),
        selection_date: today,
        rank: 2,
        summary: 'Breakthrough in multimodal models',
      },
      {
        title: 'AI startup funding surges',
        category: 'business',
        source_name: 'TechCrunch',
        source_url: 'https://techcrunch.com',
        article_url: 'https://techcrunch.com/news/1',
        published_at: new Date().toISOString(),
        selection_date: today,
        rank: 3,
        summary: 'Record investment in AI companies',
      },
    ];

    const { error: articlesError } = await supabase
      .from('ai_news_articles')
      .upsert(articlesData, {
        onConflict: 'article_url',
      });

    if (articlesError) {
      console.error('Error creating articles:', articlesError);
      return NextResponse.json({ error: articlesError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      digestCreated: true,
      articlesCount: articlesData.length,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
