export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Error:", err);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err.code === "23505") {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry. This record already exists.",
    });
  }

  if (err.code === "22P02") {
    // invalid_text_representation (e.g., invalid UUID)
    return res.status(400).json({
      success: false,
      message: "Invalid input syntax (possibly invalid UUID).",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
