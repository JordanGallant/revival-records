'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import dynamic from 'next/dynamic';
import Navigator from '../_components/navigator';

const HydraCanvas = dynamic(() => import("../shaders/Hydra"), {
    ssr: false,
});

// Define the Post type
type Post = {
  slug: string;
  title: string;
  date: string;
  description?: string;
};

export default function BlogIndexPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch blog posts from an API endpoint
        async function fetchPosts() {
            try {
                const response = await fetch('/api/posts');
                
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Sort posts by date (newest first)
                const sortedPosts = [...data].sort((a: Post, b: Post) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                
                setPosts(sortedPosts);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch posts:', err);
                setError('Failed to load blog posts. Please try again later.');
                setLoading(false);
            }
        }

        fetchPosts();
    }, []);

    return (
        <>
        <Navigator/>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-start z-30 bg-stone-200 bg-opacity-10 w-[90%] h-2/3 group hover:bg-opacity-50 rounded-lg p-6 overflow-y-auto">
                <h1 className="font-badeen text-5xl text-left mb-6">Blog</h1>

                {loading ? (
                    <div className="flex items-center justify-center w-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
                        <span className="ml-2 text-gray-300">Loading posts...</span>
                    </div>
                ) : error ? (
                    <p className="text-red-400">{error}</p>
                ) : posts.length === 0 ? (
                    <p className="text-gray-400">No posts found.</p>
                ) : (
                    <ul className="space-y-6 w-full">
                        {posts.map(({ slug, title, date, description }) => (
                            <li key={slug} className="pb-4 border-b border-gray-700">
                                <Link href={`/blog/${slug}`} className="text-2xl font-semibold text-blue-400 hover:underline">
                                    {title}
                                </Link>
                                <p className="text-sm text-gray-400 mb-2">{date}</p>
                                {description && <p className="text-gray-300">{description}</p>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <HydraCanvas />
        </>
    );
}