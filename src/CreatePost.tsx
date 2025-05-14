import {useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";

interface Post {
  title: string;
  body: string;
}

const createPost = async (post: Post) => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};
export const CreatePost = () => {
  const [post, setPost] = useState<Post>({ title: "", body: "" });
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPost({ ...post, [e.target.name]: e.target.value });
  };
  const queryClient =  useQueryClient();
  const { mutate } = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      // Invalidate and refetch the post query
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      // Optionally, you can also log the response or update the UI
      console.log("Post created successfully:", data);
      setPost({ title: "", body: "" });
    },
    onMutate: async() => {
        await queryClient.cancelQueries({ queryKey: ["posts"] });
        const previousPosts = queryClient.getQueryData(["posts"]);
        queryClient.setQueryData(["posts"], (old: any) => {
            return [...old, post];
        });
        return { previousPosts };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },   
    onError: (error) => {
      console.error("Error creating post:", error);
    },
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutate(post);
  };

  return (
    <div>
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            name="title"
            value={post.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Body:</label>
          <textarea
            name="body"
            value={post.body}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">
          Create Post
          {/* <svg
                className="animate-spin h-5 w-5 text-white"
                viewBox="0 0 24 24"
          {/* {loading ? "Creating..." : "Create Post"} */}
        </button>
      </form>
    </div>
  );
};
