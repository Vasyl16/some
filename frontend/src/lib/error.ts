import axios from "axios";

export type FieldErrors = Record<string, string>;

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Array<{ field?: string; message?: string }> }
      | undefined;
    if (data?.errors && data.errors.length > 0) {
      const first = data.errors[0];
      return first?.field ? `${first.field}: ${first.message}` : first?.message ?? "Validation failed";
    }
    return data?.message ?? "Request failed";
  }
  return "Unexpected error";
};

export const getFieldErrors = (error: unknown): FieldErrors => {
  if (!axios.isAxiosError(error)) {
    return {};
  }

  const data = error.response?.data as
    | {
        errors?: Array<{ field?: string; message?: string }>;
        unknownFields?: string[];
      }
    | undefined;

  if (data?.errors?.length) {
    return data.errors.reduce<FieldErrors>((acc, item) => {
      if (item.field && item.message) {
        acc[item.field] = item.message;
      }
      return acc;
    }, {});
  }

  if (data?.unknownFields?.length) {
    return data.unknownFields.reduce<FieldErrors>((acc, field) => {
      acc[field] = "Unknown field";
      return acc;
    }, {});
  }

  return {};
};
