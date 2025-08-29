import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FeedTimeline } from "@/components/feed/feed-timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Compass } from "lucide-react";

export const Route = createFileRoute("/_app/feed")({
  component: FeedPage,
});

function FeedPage() {
  const [activeTab, setActiveTab] = useState("for-you");

  return (
    <>
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
    </>
  );
}
