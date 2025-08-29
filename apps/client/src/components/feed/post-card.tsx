import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLikePost, useUnlikePost } from "@/services/posts/mutations";
import type { Post } from "@/types/posts";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  CheckCircle,
  Quote,
  TrendingUp,
  Star,
  BookOpen,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  isLiked?: boolean;
}

export function PostCard({ post, isLiked = false }: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const { isPending: isLikePending, mutate: likePost } = useLikePost();
  const { isPending: isUnlikePending, mutate: unlikePost } = useUnlikePost();

  const handleLikeToggle = () => {
    if (liked) {
      unlikePost(post.id);
      setLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      likePost(post.id);
      setLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPostTypeIcon = (type: Post["postType"]) => {
    switch (type) {
      case "quote":
        return <Quote className="h-4 w-4" />;
      case "progress":
        return <TrendingUp className="h-4 w-4" />;
      case "review":
        return <Star className="h-4 w-4" />;
      case "thought":
        return <BookOpen className="h-4 w-4" />;
      case "recommendation":
        return <ThumbsUp className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getPostTypeColor = (type: Post["postType"]) => {
    switch (type) {
      case "quote":
        return "bg-blue-100 text-blue-800";
      case "progress":
        return "bg-green-100 text-green-800";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "thought":
        return "bg-purple-100 text-purple-800";
      case "recommendation":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user.profileImage} alt={post.user.name} />
              <AvatarFallback>{getInitials(post.user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold ">
                  {post.user.name || post.user.username || "Unknown User"}
                </h4>
                {post.user.isVerified && (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
                <Badge
                  variant="secondary"
                  className={cn(getPostTypeColor(post.postType), "text-xs")}
                >
                  <div className="flex items-center space-x-1">
                    {getPostTypeIcon(post.postType)}
                    <span className="capitalize">{post.postType}</span>
                  </div>
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Book Info */}
        {post.book && (
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
            {post.book.thumbnail && (
              <img
                src={post.book.thumbnail}
                alt={post.book.title}
                className="h-12 w-8 object-cover rounded"
              />
            )}
            <div>
              <h5 className="font-medium ">{post.book.title}</h5>
              <p className="text-sm text-gray-600">
                by {post.book.authors?.join(", ") || "Unknown Author"}
              </p>
            </div>
          </div>
        )}

        {/* Quote */}
        {post.quoteText && (
          <blockquote className="border-l-4 border-blue-500 pl-4 mb-4 italic text-gray-700">
            "{post.quoteText}"
            {post.pageNumber && (
              <cite className="block mt-2 text-sm text-gray-500">
                — Page {post.pageNumber}
              </cite>
            )}
          </blockquote>
        )}

        {/* Progress */}
        {post.progressPercentage !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Reading Progress</span>
              <span className="text-sm font-medium">
                {post.progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${post.progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Rating */}
        {post.rating && (
          <div className="flex items-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < post.rating!
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                )}
              />
            ))}
            <span className="text-sm text-gray-600 ml-2">
              {post.rating}/5 stars
            </span>
          </div>
        )}

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div className="mb-4">
            <img
              src={post.imageUrl}
              alt="Post image"
              className="w-full max-h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeToggle}
              className={cn(
                "hover:text-red-500",
                liked ? "text-red-500" : "text-gray-500"
              )}
              isLoading={isLikePending || isUnlikePending}
            >
              <Heart className={cn("h-4 w-4 mr-1", liked && "fill-current")} />
              {likesCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {post.commentsCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-green-500"
            >
              <Repeat2 className="h-4 w-4 mr-1" />
              {post.repostsCount}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
