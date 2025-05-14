import { getPostBySlug } from '../../../lib/mdx';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    const { content, frontmatter } = await getPostBySlug(slug);

    return NextResponse.json({
      content,
      frontmatter
    });
  } catch (error) {
    console.error(`Error fetching post with slug ${params.slug}:`, error);
    return NextResponse.json(
      { error: 'Post not found or error occurred' },
      { status: 404 }
    );
  }
}
