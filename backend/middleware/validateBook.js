import { AppError } from "../utils/appError.js"

export const validateBook = (req, res, next) => {
  const { title, author, publishedYear } = req.body;
  if (!title || !author || !publishedYear) {
    throw new AppError("Missing required fields: title, author, or publishedYear", 400);
  }
  next();
};
