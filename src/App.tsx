import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "./redux/store";
import { increment, decrement } from "./redux/features/counter/counterSlice";

const App = () => {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();
  const handleIncrement = () => {
    dispatch(increment());
  };
  const handleDecrement = () => {
    dispatch(decrement());
  };
  return (
    <div className="w-full h-screen">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-2xl">Counter</h3>
          <h1 className="text-4xl">{count}</h1>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleIncrement}
          >
            Increment
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={handleDecrement}
          >
            Decrement
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
