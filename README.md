# 🚀 Fullstack Boilerplate: React + Redux Toolkit + React Query + TypeScript

This project demonstrates a modern fullstack setup using:

- **React + TypeScript** (frontend)
- **Redux Toolkit** for client-side state management
- **TanStack React Query** for fetching, caching, and mutating server data
- **PostgreSQL + Express + Prisma** (backend, optional)

> This boilerplate is perfect for scalable apps that need a mix of client-side and server-side state management.

---

## 📦 Tech Stack

| Tool                 | Purpose                                      |
|----------------------|----------------------------------------------|
| React                | Frontend UI framework                        |
| Redux Toolkit        | App-wide (client) state management           |
| TanStack React Query | Server-side state fetching and caching       |
| TypeScript           | Static typing for better dev experience      |
| Prisma (Optional)    | Type-safe ORM for PostgreSQL backend         |

---

## 🛠️ Installation & Setup

```bash
npx create-vite my-app --template react-ts
cd my-app

# Install dependencies
npm install @reduxjs/toolkit react-redux
npm install @tanstack/react-query
```

**(Optional) Update Vite config for custom server port:**
```ts
// vite.config.ts
export default defineConfig({
  server: {
    port: 3001, // your preferred port
  },
});
```

---

## 🧠 Redux Toolkit Setup

**1. Create Store (`store.ts`):**
```ts
import { configureStore } from '@reduxjs/toolkit';
import ticketReducer from './features/ticketSlice';

export const store = configureStore({
  reducer: {
    ticket: ticketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```
**2. Create Slice (`features/ticketSlice.ts`):**
```ts
import { createSlice } from '@reduxjs/toolkit';

const ticketSlice = createSlice({
  name: 'ticket',
  initialState: {
    available: [],
    booked: [],
  },
  reducers: {
    setAvailableVehicle: (state, action) => {
      state.available = action.payload;
    },
    setBookedTicket: (state, action) => {
      state.booked = action.payload;
    },
  },
});

export const { setAvailableVehicle, setBookedTicket } = ticketSlice.actions;
export default ticketSlice.reducer;
```

**3. Use Redux State and Actions in a Component:**
```tsx
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setAvailableVehicle, setBookedTicket } from '../features/ticketSlice';

const SomeComponent = () => {
  const available = useSelector((state: RootState) => state.ticket.available);
  const booked = useSelector((state: RootState) => state.ticket.booked);
  const dispatch = useDispatch();

  // Example: Update available vehicles
  const updateAvailable = (vehicles: any[]) => {
    dispatch(setAvailableVehicle(vehicles));
  };

  // Example: Update booked tickets
  const updateBooked = (tickets: any[]) => {
    dispatch(setBookedTicket(tickets));
  };

  return (
    <div>
      <h3>Available Vehicles</h3>
      <pre>{JSON.stringify(available, null, 2)}</pre>
      <button onClick={() => updateAvailable([{ id: 1, name: 'Car A' }])}>
        Set Available
      </button>

      <h3>Booked Tickets</h3>
      <pre>{JSON.stringify(booked, null, 2)}</pre>
      <button onClick={() => updateBooked([{ id: 101, seat: 'A1' }])}>
        Set Booked
      </button>
    </div>
  );

```


---

## 🌐 React Query Setup

**1. Wrap App in QueryClientProvider (`main.tsx`):**
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </Provider>
);
```

**2. Data Fetching Example with `useQuery`:**
```tsx
import { useQuery } from '@tanstack/react-query';

const fetchPosts = async () => {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
};

const Posts = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 5000,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {(error as Error).message}</p>;

  return (
    <ul>
      {data.slice(0, 5).map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
};
```

---

## ✍️ Creating Data with `useMutation`

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';

interface Post {
  title: string;
  body: string;
}

const createPost = async (post: Post) => {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

export const CreatePost = () => {
  const [post, setPost] = useState<Post>({ title: '', body: '' });
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: createPost,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData(['posts']);
      queryClient.setQueryData(['posts'], (old: any) => [...old, newPost]);
      return { previousPosts };
    },
    onError: (err, newPost, context: any) => {
      queryClient.setQueryData(['posts'], context.previousPosts);
    },
    onSuccess: (data) => {
      console.log('Post created:', data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPost({ ...post, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(post);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" value={post.title} onChange={handleChange} required />
      <textarea name="body" value={post.body} onChange={handleChange} required />
      <button type="submit">Create Post</button>
    </form>
  );
};
```

---

## 💡 `useMutation` Options Explained

| Option        | Purpose                                               |
|---------------|------------------------------------------------------|
| mutationFn    | Function that makes the POST/PUT/DELETE request      |
| onMutate      | Optimistic update: update the cache before request   |
| onError       | Rollback cache update if the request fails           |
| onSuccess     | Called when mutation completes successfully          |
| onSettled     | Called when mutation either fails or succeeds        |
| invalidateQueries | Forces refetch of cached query data              |

---

## 🧪 Common API Errors & Handling Tips

| Endpoint            | Error Message                        | Suggested Fix                        |
|---------------------|--------------------------------------|--------------------------------------|
| /total-earnings     | 500: Internal Server Error           | Backend bug — check logs and DB joins|
| /ride-history       | Ride location missing                | Ensure location is included in response|
| update driver status| 403: "The Driver Status Is Unexpected"| Validate status string on backend    |

> Always wrap API calls in try-catch or use `onError` in React Query to avoid crashes and provide user feedback.

---

## 🗂️ Folder Structure

```
src/
│
├── api/                # API functions using fetch or axios
├── components/         # Reusable React components
├── features/           # Redux Toolkit slices
├── hooks/              # Custom hooks
├── pages/              # Main route views
├── store.ts            # Redux store
├── main.tsx            # App entry
└── App.tsx             # Root component
```

---

## ✅ Best Practices

- Use Redux Toolkit for UI and global client state.
- Use React Query for all server-side communication.
- Structure your app by feature or domain.
- Avoid duplicating data between Redux and React Query.
- Use optimistic updates for a smoother user experience.

---

## 🚀 Contributing

Contributions are welcome! Please fork the repo and submit a pull request.

---

## 📜 License

MIT — use it freely for both commercial and personal projects.

---

## 💬 Author

[@jaymhorsh](https://github.com/jaymhorsh) — Building clean, scalable fullstack systems.

---















--------------------------- Zustand adnd React Query -----------------------------------------------

# 🚀 Transportation Hub – Next.js + Zustand + React Query

A modern Next.js project using [Zustand](https://zustand-demo.pmnd.rs/) for global state management and [TanStack React Query](https://tanstack.com/query/latest) for efficient server data fetching and caching.

---

## 🛠️ Installation

```bash
npm install zustand @tanstack/react-query
# or
yarn add zustand @tanstack/react-query
```

---

## ⚡ Setup

### 1. **Create a Zustand Store**

Create `src/store/useTicketStore.ts`:

```typescript
import { create } from "zustand";

type Ticket = {
  fromTerminal: string;
  toTerminal: string;
  departureDate: string;
  returnDate: string;
  tripType: string;
  numPassenger: string;
  fromTerminalRef: string;
  toTerminalRef: string;
};

type AvailableVehicle = {
  acAvailable: string;
  price: string;
  id: string;
  bookedSeat: number[];
};

type TicketState = {
  ticket: Ticket;
  bookedSeat: number[];
  availableVehicle: AvailableVehicle;
  setTicket: (ticket: Ticket) => void;
  setBookedSeat: (seats: number[]) => void;
  setAvailableVehicle: (vehicle: AvailableVehicle) => void;
};

export const useTicketStore = create<TicketState>((set) => ({
  ticket: {
    fromTerminal: "",
    toTerminal: "",
    departureDate: "",
    returnDate: "",
    tripType: "",
    numPassenger: "",
    fromTerminalRef: "",
    toTerminalRef: "",
  },
  bookedSeat: [],
  availableVehicle: {
    acAvailable: "",
    price: "",
    id: "",
    bookedSeat: [],
  },
  setTicket: (ticket) => set({ ticket }),
  setBookedSeat: (bookedSeat) => set({ bookedSeat }),
  setAvailableVehicle: (availableVehicle) => set({ availableVehicle }),
}));
```

---

### 2. **Set Up React Query Provider**

In `pages/_app.tsx`:

```typescript
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
```

---

### 3. **Fetching Data with React Query and Syncing to Zustand**

Example: Fetch available vehicles and store in Zustand.

```typescript
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTicketStore } from '../store/useTicketStore';

const fetchVehicles = async () => {
  const res = await fetch('/api/vehicles');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function VehicleSyncer() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  });

  const setAvailableVehicle = useTicketStore((state) => state.setAvailableVehicle);

  useEffect(() => {
    if (data) {
      setAvailableVehicle(data); // adapt if your API returns { vehicles: [...] }
    }
  }, [data, setAvailableVehicle]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading vehicles</div>;
  return null; // This component just syncs data, no UI needed
}
```

---

### 4. **Using Zustand State in Components**

```typescript
import { useTicketStore } from '../store/useTicketStore';

export default function TicketInfo() {
  const ticket = useTicketStore((state) => state.ticket);
  const setTicket = useTicketStore((state) => state.setTicket);

  // Example usage
  // setTicket({ ...ticket, fromTerminal: "A" });

  return (
    <div>
      <div>From: {ticket.fromTerminal}</div>
      <div>To: {ticket.toTerminal}</div>
      {/* ... */}
    </div>
  );
}
```

---

## 🗂️ Folder Structure

```
src/
├── pages/
├── store/
│   └── useTicketStore.ts
├── components/
│   └── VehicleSyncer.tsx
│   └── TicketInfo.tsx
```

---

## ✅ Best Practices

- Use **Zustand** for UI/global state.
- Use **React Query** for all server data fetching and caching.
- Sync server data to Zustand only when you need global access or want to persist it.
- Keep your stores small and focused.

---

## 📚 Learn More

- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Next.js Docs](https://nextjs.org/docs)

---

**Now you have a clean, scalable setup for global state and server data in your Next.js app!**
