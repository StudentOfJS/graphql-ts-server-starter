import { ValidationError } from "yup";

export const formatYupErrors = (err: ValidationError) => {
  const errors: Array<{ path: string; message: string }> = err.inner.map(e => ({
    path: e.path,
    message: e.message
  }))
  return errors
}