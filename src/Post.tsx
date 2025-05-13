import { useQuery } from "@tanstack/react-query";

const fetchPosts = async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};
const Post = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  return (
    <div className=" min-h-screen bg-red-500  flex  mx-auto items-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white shadow-xl rounded-2xl p-10 flex flex-col items-center space-y-6 w-80">
        <h1 className="text-2xl font-bold text-gray-800">Posts</h1>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        {data && (
          <ul className="space-y-4">
            {data.slice(0,5).map((post: any) => (
              <li key={post.id} className="bg-gray-100 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <p>{post.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Post;
