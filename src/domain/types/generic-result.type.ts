export type GenericResult<T> = {
  isSuccess: boolean;
  data?: T | T[];
};
