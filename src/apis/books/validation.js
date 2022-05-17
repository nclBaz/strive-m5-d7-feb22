import { checkSchema, validationResult } from "express-validator"
import createError from "http-errors"

const bookSchema = {
  title: {
    in: ["body"],
    isString: {
      errorMessage: "Title is a mandatory field and needs to be a string!",
    },
  },
  category: {
    in: ["body"],
    isString: {
      errorMessage: "Category is a mandatory field and needs to be a string!",
    },
  },
  // email: {
  //   in: ["body"],
  //   isEmail: {
  //     errorMessage: "Email needs to be in the valid email format!",
  //   },
  // },
}

// Middlewares chain
// 1. checkSchema(bookSchema) --> 2. checkValidationResult

// 1.
export const checkBookSchema = checkSchema(bookSchema)

// 2.
export const checkValidationResult = (req, res, next) => {
  // Check if previous middleware (checkBookSchema) has found any error
  const errors = validationResult(req)
  console.log(errors)

  if (!errors.isEmpty()) {
    // If we had validation errors --> trigger 400
    next(createError(400, "Validation errors!", { errorsList: errors.array() }))
    // err --> {status: 400, message: "Validation errors", errorsList: [{....}]}
  } else {
    // Else --> normal flow
    next()
  }
}
