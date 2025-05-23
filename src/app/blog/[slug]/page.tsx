'use client';

import { useState, useEffect, use } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { notFound } from 'next/navigation';
import { serialize } from 'next-mdx-remote/serialize';
import Navigator from '@/app/_components/navigator';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import dynamic from 'next/dynamic';

type Post = {
  metadata: {
    title: string;
    date: string;
  };
  content: string;
};

async function getPost(slug: string): Promise<Post | null> {
  const res = await fetch(`https://blog-api-bd4m.onrender.com/posts/${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) return null;

  return res.json();
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // need to use use()
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [serializedContent, setSerializedContent] = useState<any>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await getPost(slug);
        if (postData) {
          setPost(postData);
          const serialized = await serialize(postData.content, {
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypePrism, rehypeSlug],
            },
          });
          setSerializedContent(serialized);
        } else {
          setError('Post not found');
        }
      } catch (error) {
        setError('Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!post || !serializedContent) {
    return notFound();
  }  

  return (
    <>
    <Navigator />
        <div className="flex justify-center">
      <article className="p-6 prose">
        <h1 className="text-4xl font-bold">{post.metadata.title}</h1>
        <p className="text-sm text-gray-400">{post.metadata.date}</p>
        <MDXRemote {...serializedContent} />
      </article>
      </div>
    </>
  );
}