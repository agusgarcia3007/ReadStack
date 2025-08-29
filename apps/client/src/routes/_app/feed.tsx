import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FeedTimeline } from "@/components/feed/feed-timeline";
import { PostComposerForm } from "@/components/feed/post-composer-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Users, Compass } from "lucide-react";

export const Route = createFileRoute("/_app/feed")({
  component: FeedPage,
});

function FeedPage() {
  const [showComposer, setShowComposer] = useState(false);
  const [activeTab, setActiveTab] = useState("for-you");

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

      {/* Feed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="for-you" className="flex items-center space-x-2">
            <Compass className="h-4 w-4" />
            <span>For You</span>
          </TabsTrigger>
          <TabsTrigger
            value="following"
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Following</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="for-you" className="mt-6">
          <FeedTimeline type="discover" />
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          <FeedTimeline type="following" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
