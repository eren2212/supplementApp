import React from "react";
import BlogDetailClient from "@/app/components/blog/BlogDetailClient";

interface BlogDetailPageProps {
  params: {
    id: string;
  };
}

const BlogDetailPage = ({ params }: BlogDetailPageProps) => {
  return (
    <div>
      <BlogDetailClient id={params.id} />
    </div>
  );
};

export default BlogDetailPage;
