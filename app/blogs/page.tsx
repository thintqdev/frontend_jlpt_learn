"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Book } from "lucide-react";
import { getBlogPosts, type BlogPost } from "@/lib/blogs";
import AppLayout from "@/components/app-layout";

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const allPosts = await getBlogPosts();
        setPosts(allPosts);
      } catch (err) {
        setError("Lỗi khi tải bài viết");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Book className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Phụ lục
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Những bài viết hữu ích về học tiếng Nhật
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Blog posts grid */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
            {posts.map((post) => (
              <Link key={post.id} href={`/blogs/${post.id}`}>
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full group">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-3 group-hover:scale-110 transition-transform">
                      <Book className="w-5 h-5 text-white" />
                    </div>
                    <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                      Bài {post.id}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {post.frontmatter?.description || "Nhấp để đọc bài viết"}
                  </p>
                  <div className="mt-4 text-red-600 font-medium text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Đọc tiếp →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              Hiện tại chưa có bài viết nào
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
