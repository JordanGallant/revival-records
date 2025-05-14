// components/ClientBlogPostPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { notFound, useRouter } from 'next/navigation';

export default function ClientBlogPostPage({ slug }: { slug: string }) {
  const [post, setPost] = useState<{
    content: any;
    frontmatter: {
      title: string;
      date: string;
      description?: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPost() {
      if (!slug) {
        router.push('/404');
        return;
      }

      try {
        const response = await fetch(`/api/posts/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            router.push('/404');
            return;
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setPost(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Failed to load blog post. Please try again later.');
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="...">Loading post...</div>
    );
  }

  if (error) {
    return (
      <div className="...">Error: {error}</div>
    );
  }

  if (!post || !post.frontmatter?.title) {
    return notFound();
  }

  return (
    <div className="...">
      <h1>{post.frontmatter.title}</h1>
      <p>{post.frontmatter.date}</p>
      <div className="prose prose-invert max-w-none">
        <MDXRemote {...post.content} />
      </div>
    </div>
  );
}
