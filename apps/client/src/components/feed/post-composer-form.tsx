import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BookSelectionDialog } from "@/components/books/book-selection-dialog";
import { useCreatePost } from "@/services/posts/mutations";
import type { CreatePostData } from "@/types/posts";
import type { Book } from "@/services/books/service";
import {
  Quote,
  TrendingUp,
  Star,
  BookOpen,
  ThumbsUp,
  X,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const postFormSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000, "Content too long"),
  postType: z.enum([
    "quote",
    "progress",
    "review",
    "thought",
    "recommendation",
  ]),
  isPrivate: z.boolean(),
  bookId: z.string().optional(),
  quoteText: z.string().max(1000).optional(),
  pageNumber: z.number().min(1).optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
  rating: z.number().min(1).max(5).optional(),
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface PostComposerFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function PostComposerForm({
  onSuccess,
  className,
}: PostComposerFormProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);

  const { isPending: isCreatingPost, mutate: createPost } = useCreatePost();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: "",
      postType: "thought",
      isPrivate: false,
      bookId: undefined,
      quoteText: undefined,
      pageNumber: undefined,
      progressPercentage: undefined,
      rating: undefined,
    },
  });

  const postType = form.watch("postType");

  const onSubmit = (values: PostFormValues) => {
    const postData: CreatePostData = {
      content: values.content,
      postType: values.postType,
      isPrivate: values.isPrivate,
      ...(values.bookId && { bookId: values.bookId }),
      ...(values.quoteText && { quoteText: values.quoteText }),
      ...(values.pageNumber && { pageNumber: values.pageNumber }),
      ...(values.progressPercentage !== undefined && {
        progressPercentage: values.progressPercentage,
      }),
      ...(values.rating && { rating: values.rating }),
    };

    createPost(postData, {
      onSuccess: () => {
        form.reset();
        setSelectedBook(null);
        onSuccess?.();
      },
    });
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    form.setValue("bookId", book.id);
  };

  const getPostTypeIcon = (type: PostFormValues["postType"]) => {
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
        <div className="mb-4">
          <h3 className="font-semibold">Create Post</h3>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Post Type */}
            <FormField
              control={form.control}
              name="postType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          <div className="flex items-center space-x-2">
                            {getPostTypeIcon(field.value)}
                            <span className="capitalize">{field.value}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Book Selection */}
            <FormItem>
              <FormLabel>Book (Optional)</FormLabel>
              <div className="space-y-2">
                {selectedBook ? (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {(selectedBook.thumbnail || selectedBook.coverImage) && (
                      <img
                        src={
                          selectedBook.coverImage ||
                          selectedBook.thumbnail ||
                          ""
                        }
                        alt={selectedBook.title}
                        className="h-12 w-8 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h5 className="font-medium">{selectedBook.title}</h5>
                      <p className="text-sm text-gray-600">
                        by{" "}
                        {selectedBook.authors?.join(", ") || "Unknown Author"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedBook(null);
                        form.setValue("bookId", "");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setBookDialogOpen(true)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search or add a book...
                  </Button>
                )}
              </div>
              <FormDescription>
                Select a book to associate with your post, or create a new one.
              </FormDescription>
            </FormItem>

            {/* Quote Text (for quote posts) */}
            {postType === "quote" && (
              <FormField
                control={form.control}
                name="quoteText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the quote here..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Page Number (for quotes) */}
            {postType === "quote" && (
              <FormField
                control={form.control}
                name="pageNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Page number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Progress Percentage (for progress posts) */}
            {postType === "progress" && (
              <FormField
                control={form.control}
                name="progressPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reading Progress (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Progress percentage"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Rating (for review posts) */}
            {postType === "review" && (
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1-5 stars)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a rating" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Main Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Share your ${postType}...`}
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-between items-center pt-4">
              <div className="flex items-center space-x-2">
                {/* Future: Add image upload button */}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setSelectedBook(null);
                    onSuccess?.();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isCreatingPost}
                  disabled={!form.formState.isValid}
                >
                  Post
                </Button>
              </div>
            </div>
          </form>
        </Form>

        {/* Book Selection Dialog */}
        <BookSelectionDialog
          open={bookDialogOpen}
          onOpenChange={setBookDialogOpen}
          onBookSelect={handleBookSelect}
        />
      </CardContent>
    </Card>
  );
}
