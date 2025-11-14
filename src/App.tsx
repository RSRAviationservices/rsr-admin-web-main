import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient } from "./api/queryClient";
import AppInitializer from "./AppInitializer";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <main className="main w-screen h-screen">
      <QueryClientProvider client={queryClient}>
        <AppInitializer />
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </main>
  );
}

export default App;
