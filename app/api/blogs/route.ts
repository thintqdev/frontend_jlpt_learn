import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		const blogsDir = path.join(process.cwd(), 'public', 'blogs');

		if (id) {
			// Get single blog post
			const filePath = path.join(blogsDir, `${id}.md`);

			if (!fs.existsSync(filePath)) {
				return NextResponse.json({ error: 'Not found' }, { status: 404 });
			}

			const content = fs.readFileSync(filePath, 'utf-8');
			const { data, content: markdownContent } = matter(content);

			return NextResponse.json({
				id,
				title: data.title || `Blog Post ${id}`,
				content: markdownContent,
				frontmatter: data,
			});
		} else {
			// Get all blog posts
			const files = fs.readdirSync(blogsDir);
			const mdFiles = files.filter((file) => file.endsWith('.md')).sort();

			const posts = mdFiles.map((file) => {
				const filePath = path.join(blogsDir, file);
				const content = fs.readFileSync(filePath, 'utf-8');
				const { data, content: markdownContent } = matter(content);

				const fileId = file.replace('.md', '');
				return {
					id: fileId,
					title: data.title || `Blog Post ${fileId}`,
					content: markdownContent,
					frontmatter: data,
				};
			});

			return NextResponse.json(posts);
		}
	} catch (error) {
		console.error('API error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
