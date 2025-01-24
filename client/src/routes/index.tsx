import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex items-center justify-center">
      <Link to={"/room"}>
        <Button>Make a call</Button>
      </Link>
    </div>
  );
}
