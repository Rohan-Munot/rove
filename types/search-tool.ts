export interface SearchOptions {
  query: string;
  maxResults?: number;
  searchDepth?: "basic" | "advanced";
  timeRange?: string;
  include_images?: boolean;
  topic?: "general" | "news" | "finance" | undefined;
}
