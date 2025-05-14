import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

const POSTS_PATH = path.join(process.cwd(), 'src/app/posts'); //get posts directory

export interface PostMetadata {
  title: string;
  date: string;
  description?: string;
}

export async function getPostBySlug(slug: string): Promise<{
  content: MDXRemoteSerializeResult;
  frontmatter: { [key: string]: any };
}> {
  const filePath = path.join(POSTS_PATH, `${slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, 'utf8');

  const { content, data } = matter(fileContent);
  const mdxSource = await serialize(content, { scope: data });

  return {
    content: mdxSource,
    frontmatter: data as PostMetadata,
  };
}

export function getAllPostSlugs(): string[] {
  return fs
    .readdirSync(POSTS_PATH)
    .filter(file => file.endsWith('.mdx'))
    .map(file => file.replace(/\.mdx$/, ''));
}
