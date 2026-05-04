export const parsePagination = (query: unknown) => {
  const q = query as Record<string, unknown>;
  const pageRaw = typeof q.page === "string" ? q.page : undefined;
  const limitRaw = typeof q.limit === "string" ? q.limit : undefined;

  const page = Math.max(1, Number(pageRaw ?? 1) || 1);
  const limit = Math.min(50, Math.max(1, Number(limitRaw ?? 10) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const paginateResponse = <T,>(args: {
  items: T[];
  page: number;
  limit: number;
  total: number;
}) => {
  const totalPages = Math.max(1, Math.ceil(args.total / args.limit));
  return {
    items: args.items,
    page: args.page,
    limit: args.limit,
    total: args.total,
    totalPages,
  };
};

