import { LS_AUTH_KEYS } from "@/lib/constants";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PostComposerForm } from "@/components/feed/post-composer-form";

const { TOKEN } = LS_AUTH_KEYS;

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem(TOKEN);
    if (!token) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const [showComposer, setShowComposer] = useState(false);

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl flex items-center gap-2 font-bold text-gray-900">
          <img src="/logo-black.svg" alt="ReadStack" className="h-8 w-8" />{" "}
          ReadStack
        </h1>
        <Button onClick={() => setShowComposer(true)}>
          <PlusCircle className="h-4 w-4" />
          <span>New Post</span>
        </Button>
      </div>

      {/* Post Composer */}
      {showComposer && (
        <div className="mb-8">
          <PostComposerForm onSuccess={() => setShowComposer(false)} />
        </div>
      )}

      <Outlet />
    </div>
  );
}
