import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { PostCard } from "./post-card";
import { PostSkeleton } from "./post-skeleton";
import { useFeedInfinite } from "@/services/feed/query";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedTimelineProps {
  type?: "following" | "discover";
  className?: string;
}

export function FeedTimeline({
  type = "following",
  className,
}: FeedTimelineProps) {
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch,
  } = useFeedInfinite({ type });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (status === "pending") {
    return (
      <div className={cn("space-y-6", className)}>
        {[...Array(3)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-gray-600 mb-4">Failed to load feed</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (posts.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium mb-2">
            {type === "following"
              ? "No posts from people you follow"
              : "No posts to discover"}
          </h3>
          <p className="text-gray-500 mb-4">
            {type === "following"
              ? "Follow some users to see their posts in your feed."
              : "Check back later for new posts to discover."}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {posts.map((post, index) => (
        <PostCard
          key={`${post.id}-${index}`}
          post={post}
          isLiked={false} // TODO: Implement user's like status tracking
        />
      ))}

      {/* Loading indicator for infinite scroll */}
      <div ref={ref} className="flex justify-center py-6">
        {isFetchingNextPage && (
          <div className="space-y-6 w-full">
            <PostSkeleton />
          </div>
        )}
        {!hasNextPage && posts.length > 0 && (
          <p className="text-gray-500 text-sm">You've reached the end!</p>
        )}
      </div>

      {/* Global loading indicator */}
      {isFetching && !isFetchingNextPage && (
        <div className="fixed bottom-4 right-4">
          <div className="bg-white shadow-lg rounded-full p-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          </div>
        </div>
      )}
    </div>
  );
}
