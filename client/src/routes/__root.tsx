import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <div className="flex min-h-screen flex-col container mx-auto py-4">
        <div className="grid w-full grow">
          <Outlet />
        </div>
      </div>
    </React.Fragment>
  );
}
