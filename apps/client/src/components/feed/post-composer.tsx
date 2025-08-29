import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCreatePost } from "@/services/posts/mutations";
import type { CreatePostData } from "@/types/posts";
import {
  Quote,
  TrendingUp,
  Star,
  BookOpen,
  ThumbsUp,
  Image,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PostComposerProps {
  onSuccess?: () => void;
  className?: string;
}

export function PostComposer({ onSuccess, className }: PostComposerProps) {
  const [postType, setPostType] =
    useState<CreatePostData["postType"]>("thought");
  const [content, setContent] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [pageNumber, setPageNumber] = useState<number | undefined>();
  const [progressPercentage, setProgressPercentage] = useState<
    number | undefined
  >();
  const [rating, setRating] = useState<number | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);

  const { isPending: isCreatingPost, mutate: createPost } = useCreatePost();

  const handleSubmit = () => {
    if (!content.trim()) return;

    const postData: CreatePostData = {
      content: content.trim(),
      postType,
      ...(quoteText && { quoteText }),
      ...(pageNumber && { pageNumber }),
      ...(progressPercentage !== undefined && { progressPercentage }),
      ...(rating && { rating }),
    };

    createPost(postData, {
      onSuccess: () => {
        setContent("");
        setQuoteText("");
        setPageNumber(undefined);
        setProgressPercentage(undefined);
        setRating(undefined);
        setIsExpanded(false);
        onSuccess?.();
      },
    });
  };

  const getPostTypeIcon = (type: CreatePostData["postType"]) => {
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
    }
  };

  if (!isExpanded) {
    return (
      <Card
        className={cn("w-full cursor-pointer", className)}
        onClick={() => setIsExpanded(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex-1 text-gray-500">
              What are you reading today?
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Create Post</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Post Type Selector */}
          <div>
            <Label htmlFor="postType">Post Type</Label>
            <Select
              value={postType}
              onValueChange={(value: CreatePostData["postType"]) =>
                setPostType(value)
              }
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    {getPostTypeIcon(postType)}
                    <span className="capitalize">{postType}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thought">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Thought</span>
                  </div>
                </SelectItem>
                <SelectItem value="quote">
                  <div className="flex items-center space-x-2">
                    <Quote className="h-4 w-4" />
                    <span>Quote</span>
                  </div>
                </SelectItem>
                <SelectItem value="progress">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Progress</span>
                  </div>
                </SelectItem>
                <SelectItem value="review">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>Review</span>
                  </div>
                </SelectItem>
                <SelectItem value="recommendation">
                  <div className="flex items-center space-x-2">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Recommendation</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quote Text (for quote posts) */}
          {postType === "quote" && (
            <div>
              <Label htmlFor="quote">Quote Text</Label>
              <Textarea
                id="quote"
                placeholder="Enter the quote here..."
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="mt-2">
                <Label htmlFor="page">Page Number (optional)</Label>
                <input
                  id="page"
                  type="number"
                  placeholder="Page number"
                  value={pageNumber || ""}
                  onChange={(e) =>
                    setPageNumber(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          )}

          {/* Progress Percentage (for progress posts) */}
          {postType === "progress" && (
            <div>
              <Label htmlFor="progress">Reading Progress (%)</Label>
              <input
                id="progress"
                type="number"
                min="0"
                max="100"
                placeholder="Progress percentage"
                value={progressPercentage || ""}
                onChange={(e) =>
                  setProgressPercentage(
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          {/* Rating (for review posts) */}
          {postType === "review" && (
            <div>
              <Label htmlFor="rating">Rating (1-5 stars)</Label>
              <Select
                value={rating?.toString() || ""}
                onValueChange={(value) =>
                  setRating(value ? parseInt(value) : undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      <div className="flex items-center space-x-1">
                        {[...Array(num)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 text-yellow-400 fill-current"
                          />
                        ))}
                        <span className="ml-2">
                          {num} star{num !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Main Content */}
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder={`Share your ${postType}...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Image className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setIsExpanded(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={isCreatingPost}
                disabled={!content.trim()}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
