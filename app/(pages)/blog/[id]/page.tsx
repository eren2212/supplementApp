import React from "react";
import { use } from "react";
import BlogDetailClient from "@/app/components/blog/BlogDetailClient";

interface BlogDetailPageProps {
  params: {
    id: string;
  };
}

const BlogDetailPage = ({ params }: BlogDetailPageProps) => {
  // @ts-ignore - TypeScript hatasını gidermek için
  const blogId = use(params).id;

  return (
    <div>
      <BlogDetailClient id={blogId} />
    </div>
  );
};

export default BlogDetailPage;
