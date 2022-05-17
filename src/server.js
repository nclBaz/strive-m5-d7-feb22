// const express = require('express') <-- OLD SYNTAX
import express from "express" // <-- NEW IMPORT SYNTAX (remember to add type: "module" to package.json to use it!)
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import { join } from "path"
import usersRouter from "./apis/users/index.js"
import booksRouter from "./apis/books/index.js"
import filesRouter from "./apis/files/index.js"
import { genericErrorHandler, notFoundErrorHandler, badRequestErrorHandler, unauthorizedErrorHandler } from "./errorHandlers.js"
import createError from "http-errors"

const server = express()

const port = process.env.PORT || 3001

const publicFolderPath = join(process.cwd(), "./public")

// *********************** MIDDLEWARES ***************************

const loggerMiddleware = (req, res, next) => {
  console.log(`Request Method: ${req.method} --- URL ${req.url} --- ${new Date()}`)
  next()
}

const anotherMiddleware = (req, res, next) => {
  console.log("Hey I am another middleware!")
  next()
}

// ************************************** CORS **************************************************

/* CROSS ORIGIN RESOURCE SHARING

ORIGIN:

1. FE=http://localhost:3000 and BE=http://localhost:3001 <-- 2 different port numbers they represent different origins
2. FE=https://mywonderfulfe.com and BE =https://mywonderfulbe.com <-- 2 different domains they represent different origins
3. FE=http://domain.com and BE https://domain.com <-- 2 different protocols they represent different origins
- 

*/

// **********************************************************************************************
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

const corsOptions = {
  origin: (origin, next) => {
    // cors is a global middleware --> for each and every request we are going to be able to read the current origin value
    console.log("CURRENT ORIGIN: ", origin)

    if (!origin || whitelist.indexOf(origin) !== -1) {
      // origin is in the whitelist --> move next with no errors
      next(null, true)
    } else {
      // origin is NOT in the whitelist --> trigger an error
      next(createError(400, `Cors Error! your origin ${origin} is not in the list!`))
    }
  },
}

server.use(express.static(publicFolderPath))
server.use(cors(corsOptions)) // GLOBAL MIDDLEWARE to connect FE and BE without errors in the browser
server.use(loggerMiddleware) // GLOBAL MIDDLEWARE
server.use(express.json()) // GLOBAL MIDDLEWARE if you don't add this BEFORE the endpoints all requests' bodies will be UNDEFINED

// *********************** ENDPOINTS ****************************

server.use("/users", anotherMiddleware, usersRouter)
server.use("/books", booksRouter)
server.use("/files", filesRouter)

// ************************ ERROR HANDLERS **********************

server.use(badRequestErrorHandler) // 400
server.use(unauthorizedErrorHandler) // 401
server.use(notFoundErrorHandler) // 404
server.use(genericErrorHandler) // 500

server.listen(port, () => {
  console.table(listEndpoints(server))
  console.log(`Server is listening on port ${port}!`)
})
