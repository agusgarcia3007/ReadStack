import { useInfiniteQuery } from "@tanstack/react-query";
import { FeedService } from "./service";
import type { FeedParams } from "@/types/posts";

export const feedQueryOptions = (params: Omit<FeedParams, "offset"> = {}) => ({
  queryKey: ["feed", params],
  queryFn: ({ pageParam = 0 }) =>
    FeedService.getFeed({
      ...params,
      offset: pageParam * (params.limit || 20),
      limit: params.limit || 20,
    }),
  getNextPageParam: (lastPage: { hasMore: boolean }, pages: unknown[]) =>
    lastPage.hasMore ? pages.length : undefined,
  initialPageParam: 0,
});

export const useFeedInfinite = (params: Omit<FeedParams, "offset"> = {}) => {
  return useInfiniteQuery(feedQueryOptions(params));
};