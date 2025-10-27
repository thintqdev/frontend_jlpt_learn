"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import { getBlogPosts, getBlogPost, type BlogPost } from "@/lib/blogs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AppLayout from "@/components/app-layout";

export default function BlogDetailPage() {
  const params = useParams();
  const blogId = params.id as string;

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlogData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all posts
        const allPosts = await getBlogPosts();
        setPosts(allPosts);

        // Load single blog post
        const post = await getBlogPost(blogId);
        if (post) {
          setSelectedPost(post);
        } else {
          setError("Không tìm thấy bài viết");
        }
      } catch (err) {
        setError("Lỗi khi tải bài viết");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      loadBlogData();
    }
  }, [blogId]);

  // Get current post index for navigation
  const currentIndex = posts.findIndex((p) => p.id === blogId);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      </AppLayout>
    );
  }

  if (error || !selectedPost) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại</span>
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || "Không tìm thấy bài viết"}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Back button */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại</span>
        </Link>

        {/* Blog post header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {selectedPost.title}
          </h1>
          {selectedPost.frontmatter?.description && (
            <p className="text-gray-600 text-lg mb-4">
              {selectedPost.frontmatter.description}
            </p>
          )}
          {selectedPost.frontmatter?.date && (
            <p className="text-gray-500 text-sm mb-4">
              Ngày đăng:{" "}
              {new Date(selectedPost.frontmatter.date).toLocaleDateString(
                "vi-VN"
              )}
            </p>
          )}
          <div className="h-1 w-20 bg-gradient-to-r from-red-600 to-red-800 rounded-full" />
        </div>

        {/* Blog post content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <article
            className="prose prose-lg max-w-none 
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:text-red-900
            prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-red-800 prose-h2:border-b prose-h2:border-red-100 prose-h2:pb-2
            prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-red-700
            prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-4 prose-h4:text-red-600
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-em:text-gray-800 prose-em:italic
            prose-ul:my-4 prose-ol:my-4
            prose-li:text-gray-700 prose-li:mb-1
            prose-blockquote:border-l-4 prose-blockquote:border-red-300 prose-blockquote:bg-red-50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-red-800
            prose-code:bg-gray-100 prose-code:text-red-600 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
            prose-a:text-red-600 prose-a:no-underline prose-a:font-medium hover:prose-a:text-red-800 hover:prose-a:underline
            prose-table:border-collapse prose-table:w-full prose-table:my-6
            prose-th:bg-red-50 prose-th:text-red-900 prose-th:font-semibold prose-th:p-3 prose-th:text-left prose-th:border prose-th:border-red-200
            prose-td:p-3 prose-td:border prose-td:border-gray-200 prose-td:text-gray-700
            prose-hr:border-gray-300 prose-hr:my-8"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {selectedPost.content}
            </ReactMarkdown>
          </article>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 justify-between pb-24">
          {prevPost ? (
            <Link
              href={`/blogs/${prevPost.id}`}
              className="flex-1 bg-white rounded-2xl shadow-lg p-4 hover:shadow-2xl transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-3 text-red-600 group-hover:text-red-700">
                <ChevronLeft className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs text-gray-500">Bài trước</div>
                  <div className="font-semibold line-clamp-1">
                    {prevPost.title}
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextPost ? (
            <Link
              href={`/blogs/${nextPost.id}`}
              className="flex-1 bg-white rounded-2xl shadow-lg p-4 hover:shadow-2xl transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-end gap-3 text-red-600 group-hover:text-red-700">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Bài tiếp theo</div>
                  <div className="font-semibold line-clamp-1">
                    {nextPost.title}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
