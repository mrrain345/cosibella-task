import { Router } from "express"

export const main = Router()

main.get("/", (req, res) => {
  res.send({})
})
