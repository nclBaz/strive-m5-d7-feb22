// *********************************************** USERS ENDPOINTS *********************************************

/* ********************************************* USERS CRUD ****************************************************

1. CREATE --> POST http://localhost:3001/users/ (+ body)
2. READ --> GET http://localhost:3001/users/ (+ optional query parameters)
3. READ (single user) --> GET http://localhost:3001/users/:userId
4. UPDATE (single user) --> PUT http://localhost:3001/users/:userId (+ body)
5. DELETE (single user) --> DELETE http://localhost:3001/users/:userId

*/

import express from "express" // 3RD PARTY MODULE (needs to be installed!)
import fs from "fs" // CORE MODULE (no need to be installed!)
import { fileURLToPath } from "url" // CORE MODULE
import { dirname, join } from "path" // CORE MODULE
import uniqid from "uniqid" // 3RD PARTY MODULE (needs to be installed!)
import createError from "http-errors"

const usersRouter = express.Router()

// ********************* HOW TO GET users.json PATH **********************************

// target --> C:\Strive\FullStack\2022\Feb22\M5\strive-m5-d2-feb22\src\apis\users\users.json

// 1. we gonna start from current's file path --> C:\Strive\FullStack\2022\Feb22\M5\strive-m5-d2-feb22\src\apis\users\index.js
// const currentFileURL = import.meta.url

// console.log("CURRENT FILE URL: ", currentFileURL)

// const currentFilePath = fileURLToPath(currentFileURL)
// console.log("CURRENT FILE PATH: ", currentFilePath)

// // 2. we gonna obtain parent's folder path --> C:\Strive\FullStack\2022\Feb22\M5\strive-m5-d2-feb22\src\apis\users\
// const parentFolderPath = dirname(currentFilePath)
// console.log("PARENT FOLDER PATH: ", parentFolderPath)

// // 3. we gonna concatenate parent's folder path with users.json file name --> C:\Strive\FullStack\2022\Feb22\M5\strive-m5-d2-feb22\src\apis\users\users.json

// const usersJSONPath = join(parentFolderPath, "users.json")
// console.log("USERS JSON PATH ", usersJSONPath)

const usersJSONPath = join(dirname(fileURLToPath(import.meta.url)), "users.json")

// ***********************************************************************************

const yetAnotherMiddleware = (req, res, next) => {
  console.log("bla bla bla bla")
  next()
}

// 1.
usersRouter.post("/", (req, res, next) => {
  // 1. Read the request body to obtain the new user's data
  console.log("REQ BODY: ", req.body) // remember to add express.json() in server.js!!!!

  // 2. Add some server generated informations (unique id, createdAt)
  const newUser = { ...req.body, createdAt: new Date(), id: uniqid() }

  console.log("NEW USER ", newUser)

  // 3. Read users.json file --> obtaining an array
  const users = JSON.parse(fs.readFileSync(usersJSONPath))

  // 4. Push new user to the array
  users.push(newUser)

  // 5. Write the array back to the file
  fs.writeFileSync(usersJSONPath, JSON.stringify(users)) // we CANNOT pass an array to this function, but we can pass the stringified version of it

  // 6. Send back a proper response

  res.status(201).send({ id: newUser.id })
})

// 2.
usersRouter.get("/", yetAnotherMiddleware, (req, res, next) => {
  // 1. Read the content of users.json file
  const fileContent = fs.readFileSync(usersJSONPath) // You obtain a BUFFER object, which is MACHINE READABLE ONLY (it could be "translated" tho)

  // 2. Obtain an array from the file
  const usersArray = JSON.parse(fileContent) // JSON.parse() --> buffer to array

  // 3. Send back the array as a response

  res.send(usersArray)
})

// 3.
usersRouter.get("/:userId", (req, res, next) => {
  try {
    // 1. Obtain userId from URL
    const userID = req.params.userId
    console.log("USER ID ", userID)

    // 2. Read file --> obtaining an array
    const users = JSON.parse(fs.readFileSync(usersJSONPath))

    // 3. Find specific user in the array
    const foundUser = users.find(user => user.id === userID) // = = =

    if (foundUser) {
      // 4. Send back a proper response

      res.send(foundUser)
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

// 4.
usersRouter.put("/:userId", (req, res, next) => {
  // 1. Read file --> obtaining an array of users
  const users = JSON.parse(fs.readFileSync(usersJSONPath))

  // 2. Modify the specified user into the array by merging previous properties and new properties coming from req.body
  const index = users.findIndex(user => user.id === req.params.userId)
  const oldUser = users[index]

  const updatedUser = { ...oldUser, ...req.body, updatedAt: new Date() }

  users[index] = updatedUser

  // 3. Saving the modified array back to the file
  fs.writeFileSync(usersJSONPath, JSON.stringify(users))

  // 4. Send back a proper response
  res.send(updatedUser)
})

// 5.
usersRouter.delete("/:userId", (req, res, next) => {
  // 1. Read file --> obtaining an array of users
  const users = JSON.parse(fs.readFileSync(usersJSONPath))

  // 2. Filter out the specified user from the array, obtaining an array of just the remaining users
  const remainingUsers = users.filter(user => user.id !== req.params.userId) // ! = =

  // 3. Save remaining users back into users.json file
  fs.writeFileSync(usersJSONPath, JSON.stringify(remainingUsers))

  // 4. Send back a proper response
  res.status(204).send()
})

export default usersRouter
