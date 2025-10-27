'use client';

export interface BlogPost {
	id: string;
	title: string;
	content: string;
	frontmatter?: Record<string, any>;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
	try {
		const response = await fetch('/api/blogs');
		if (!response.ok) throw new Error('Failed to fetch blogs');
		return await response.json();
	} catch (error) {
		console.error('Error reading blog files:', error);
		return [];
	}
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
	try {
		const response = await fetch(`/api/blogs?id=${id}`);
		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		console.error(`Error reading blog post ${id}:`, error);
		return null;
	}
}
