import { useState } from "react";
import Post from "./Post";


const App = () => {
const [isMounted, setIsMounted] = useState(false);
const handleMount = () => {
  setIsMounted(() => !isMounted);
};
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Hello World</h1>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleMount}
      >
        {isMounted ? <Post id={'1'}/> : "Mount"} 
      </button>
    </div>
  );
};

export default App;
