export type ResponseBody<T> = {
  success: boolean;
  data: T;
  message?: string;
};