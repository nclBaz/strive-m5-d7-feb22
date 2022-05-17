import express from "express"
import multer from "multer"
import createError from "http-errors"

import { saveUsersAvatars } from "../../lib/fs-tools.js"

const filesRouter = express.Router()

filesRouter.post(
  "/:userId/avatar",
  multer({
    fileFilter: (req, file, multerNext) => {
      if (file.mimetype !== "image/gif") {
        multerNext(createError(400, "Only GIF allowed!"))
      } else {
        multerNext(null, true)
      }
    },
    limits: { fileSize: 1 * 1024 },
  }).single("avatar"),
  async (req, res, next) => {
    // "avatar" needs to match exactly to the field name appended to the FormData object in the FE, otherwise Multer is not going to be able to find the file into the request body
    try {
      console.log("FILE: ", req.file)
      await saveUsersAvatars(req.file.originalname, req.file.buffer)

      // find user by userId in users.json

      // update avatar field of that user adding "/img/users/3kgdm0l30101f5.gif"
      // in FE "http://localhost:3001" + "/img/users/3kgdm0l30101f5.gif"
      res.send()
    } catch (error) {
      next(error)
    }
  }
)

filesRouter.post("/multipleUpload", multer().array("avatars"), async (req, res, next) => {
  try {
    console.log("FILE: ", req.files)

    const arrayOfPromises = req.files.map(file => saveUsersAvatars(file.originalname, file.buffer))

    await Promise.all(arrayOfPromises)

    res.send()
  } catch (error) {
    next(error)
  }
})

export default filesRouter
