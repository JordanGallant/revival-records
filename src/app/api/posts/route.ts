// app/api/posts/route.ts
import { getAllPostSlugs, getPostBySlug } from '../../lib/mdx';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const slugs = getAllPostSlugs();
    
    const posts = await Promise.all(
      slugs.map(async (slug) => {
        try {
          const { frontmatter } = await getPostBySlug(slug);
          return { 
            slug, 
            title: frontmatter.title || 'Untitled Post',
            date: frontmatter.date || 'No date',
            description: frontmatter.description
          };
        } catch (error) {
          console.error(`Error loading post ${slug}:`, error);
          return null;
        }
      })
    );

    // Filter out any null entries from failed posts
    const validPosts = posts.filter(post => post !== null);
    
    return NextResponse.json(validPosts);
  } catch (error) {
    console.error('Error in GET /api/posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}