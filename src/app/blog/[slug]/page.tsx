'use client';

import { useState, useEffect } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { notFound, useRouter } from 'next/navigation';

export default function ClientBlogPostPage({ params }: { params: { slug: string } }) {
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
      if (!params?.slug) {
        router.push('/404');
        return;
      }

      try {
        const response = await fetch(`/api/posts/${params.slug}`);
        
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
  }, [params?.slug, router]);

  if (loading) {
    return (
      <div className="absolute z-30 top-[10%] left-1/2 transform -translate-x-1/2 w-[90%] bg-stone-200 bg-opacity-10 hover:bg-opacity-50 rounded-lg p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-gray-300">Loading post...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute z-30 top-[10%] left-1/2 transform -translate-x-1/2 w-[90%] bg-stone-200 bg-opacity-10 hover:bg-opacity-50 rounded-lg p-6">
        <h1 className="font-badeen text-3xl text-red-400 mb-2">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!post || !post.frontmatter?.title) {
    return notFound();
  }

  return (
    <div className="absolute z-30 top-[10%] left-1/2 transform -translate-x-1/2 w-[90%] bg-stone-200 bg-opacity-10 hover:bg-opacity-50 rounded-lg p-6">
      <h1 className="font-badeen text-5xl mb-2">{post.frontmatter.title}</h1>
      <p className="text-sm text-gray-500 mb-4">{post.frontmatter.date}</p>
      <div className="prose prose-invert max-w-none">
        <MDXRemote {...post.content} />
      </div>
    </div>
  );
}