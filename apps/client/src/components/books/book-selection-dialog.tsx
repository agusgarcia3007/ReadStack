import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/lib/utils";
import {
  useAddBookFromGoogle,
  useCreateCustomBook,
} from "@/services/books/mutations";
import { useBooks, useSearchGoogleBooks } from "@/services/books/queries";
import type { Book, GoogleBookResult } from "@/services/books/service";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Check, Loader2, Plus, Search, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const createBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  authors: z.string().min(1, "Author is required"),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  description: z.string().optional(),
  isbn10: z.string().optional(),
  isbn13: z.string().optional(),
  pageCount: z.number().min(1).optional(),
  language: z.string().optional(),
  categories: z.string().optional(),
  coverImage: z.instanceof(File).optional(),
});

type CreateBookValues = z.infer<typeof createBookSchema>;

interface BookSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookSelect: (book: Book) => void;
}

export function BookSelectionDialog({
  open,
  onOpenChange,
  onBookSelect,
}: BookSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("search");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isPending: isAddingBook, mutate: addBookFromGoogle } =
    useAddBookFromGoogle();
  const { isPending: isCreatingBook, mutate: createCustomBook } =
    useCreateCustomBook();

  // Debounce search query with 500ms delay
  const debouncedSetQuery = useDebounce((query: string) => {
    setDebouncedQuery(query);
  }, 500);

  useEffect(() => {
    debouncedSetQuery(searchQuery);
  }, [searchQuery, debouncedSetQuery]);

  // Search queries
  const { data: googleBooksResults, isLoading: isSearchingGoogle } =
    useSearchGoogleBooks(
      debouncedQuery,
      debouncedQuery.length > 2 && selectedTab === "search"
    );

  const { data: existingBooks, isLoading: isLoadingExisting } = useBooks(
    debouncedQuery,
    20,
    0
  );

  // Create book form
  const createBookForm = useForm<CreateBookValues>({
    resolver: zodResolver(createBookSchema),
    defaultValues: {
      language: "en",
    },
  });

  const handleGoogleBookSelect = (book: GoogleBookResult) => {
    addBookFromGoogle(book, {
      onSuccess: (response) => {
        onBookSelect(response.data);
        onOpenChange(false);
      },
    });
  };

  const handleExistingBookSelect = (book: Book) => {
    onBookSelect(book);
    onOpenChange(false);
  };

  const onCreateBook = (values: CreateBookValues) => {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("authors", JSON.stringify([values.authors]));

    if (values.publisher) formData.append("publisher", values.publisher);
    if (values.publishedDate)
      formData.append("publishedDate", values.publishedDate);
    if (values.description) formData.append("description", values.description);
    if (values.isbn10) formData.append("isbn10", values.isbn10);
    if (values.isbn13) formData.append("isbn13", values.isbn13);
    if (values.pageCount)
      formData.append("pageCount", values.pageCount.toString());
    formData.append("language", values.language || "en");
    if (values.categories) {
      formData.append(
        "categories",
        JSON.stringify(values.categories.split(",").map((c) => c.trim()))
      );
    }
    if (values.coverImage) formData.append("coverImage", values.coverImage);

    createCustomBook(formData, {
      onSuccess: (response) => {
        onBookSelect(response.data);
        onOpenChange(false);
        createBookForm.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select or Add a Book</DialogTitle>
          <DialogDescription>
            Search for an existing book or create a new one to associate with
            your post.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Search Books</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Book</span>
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {/* Google Books Results */}
                  {googleBooksResults?.data &&
                    googleBooksResults.data.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Google Books Results
                        </h4>
                        <div className="space-y-2">
                          {googleBooksResults.data.map((book) => (
                            <div
                              key={book.googleBooksId}
                              className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer group"
                              onClick={() => handleGoogleBookSelect(book)}
                            >
                              {book.thumbnail && (
                                <img
                                  src={book.thumbnail}
                                  alt={book.title}
                                  className="h-16 w-12 object-cover rounded flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm  truncate">
                                  {book.title}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  by{" "}
                                  {book.authors?.join(", ") || "Unknown Author"}
                                </div>
                                {book.publishedDate && (
                                  <div className="text-xs text-gray-400">
                                    Published: {book.publishedDate}
                                  </div>
                                )}
                                {book.description && (
                                  <div className="text-xs text-gray-600 line-clamp-2 mt-1">
                                    {book.description}
                                  </div>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                {isAddingBook ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Existing Books in Database */}
                  {existingBooks?.data && existingBooks.data.length > 0 && (
                    <div>
                      {googleBooksResults?.data &&
                        googleBooksResults.data.length > 0 && (
                          <Separator className="my-4" />
                        )}
                      <h4 className="text-sm font-medium  mb-3 flex items-center">
                        <Check className="h-4 w-4 mr-2" />
                        Your Library
                      </h4>
                      <div className="space-y-2">
                        {existingBooks.data.map((book) => (
                          <div
                            key={book.id}
                            className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer group"
                            onClick={() => handleExistingBookSelect(book)}
                          >
                            {(book.thumbnail || book.coverImage) && (
                              <img
                                src={book.coverImage || book.thumbnail || ""}
                                alt={book.title}
                                className="h-16 w-12 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm  truncate">
                                {book.title}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                by{" "}
                                {book.authors?.join(", ") || "Unknown Author"}
                              </div>
                              {book.publishedDate && (
                                <div className="text-xs text-gray-400">
                                  Published: {book.publishedDate}
                                </div>
                              )}
                            </div>
                            <Check className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Loading states */}
                  {(isSearchingGoogle || isLoadingExisting) &&
                    searchQuery.length > 2 && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2 text-sm text-gray-500">
                          Searching...
                        </span>
                      </div>
                    )}

                  {/* Empty state */}
                  {searchQuery.length > 2 &&
                    !isSearchingGoogle &&
                    !isLoadingExisting &&
                    !googleBooksResults?.data?.length &&
                    !existingBooks?.data?.length && (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No books found.</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try the "Create Book" tab to add it manually.
                        </p>
                      </div>
                    )}

                  {searchQuery.length <= 2 && (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Start typing to search for books
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Create Tab */}
          <TabsContent value="create" className="mt-4">
            <Form {...createBookForm}>
              <form onSubmit={createBookForm.handleSubmit(onCreateBook)}>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {/* Cover Image Upload */}
                    <FormField
                      control={createBookForm.control}
                      name="coverImage"
                      render={({ field: { onChange } }) => (
                        <FormItem>
                          <FormLabel>Cover Image (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center space-x-2"
                              >
                                <Upload className="h-4 w-4" />
                                <span>Upload Cover</span>
                              </Button>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) onChange(file);
                                }}
                              />
                              {createBookForm.watch("coverImage") && (
                                <span className="text-sm text-gray-600">
                                  {createBookForm.watch("coverImage")?.name}
                                </span>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={createBookForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="Book title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createBookForm.control}
                        name="authors"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Author(s) *</FormLabel>
                            <FormControl>
                              <Input placeholder="Author name(s)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={createBookForm.control}
                        name="publisher"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Publisher</FormLabel>
                            <FormControl>
                              <Input placeholder="Publisher" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createBookForm.control}
                        name="publishedDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Published Date</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="YYYY-MM-DD or YYYY"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={createBookForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Book description..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={createBookForm.control}
                        name="isbn10"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ISBN-10</FormLabel>
                            <FormControl>
                              <Input placeholder="ISBN-10" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createBookForm.control}
                        name="isbn13"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ISBN-13</FormLabel>
                            <FormControl>
                              <Input placeholder="ISBN-13" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createBookForm.control}
                        name="pageCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pages</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Page count"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? parseInt(e.target.value, 10)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={createBookForm.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Language (e.g., en, es)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createBookForm.control}
                        name="categories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categories</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Fiction, Mystery, etc. (comma-separated)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </ScrollArea>

                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isCreatingBook}
                    disabled={!createBookForm.formState.isValid}
                  >
                    Create & Select Book
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
