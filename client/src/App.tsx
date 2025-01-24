import { RouterProvider } from "@tanstack/react-router";
import "./global.css";

// App imports
import createRouter from "@/router";
import { SignalingServerRoomProvider } from "./context/SignalingServerContext";

const router = createRouter();

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <SignalingServerRoomProvider>
      <RouterProvider router={router} />
    </SignalingServerRoomProvider>
  );
}
