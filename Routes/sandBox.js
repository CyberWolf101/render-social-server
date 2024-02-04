const mongoose = require("mongoose")
const express = require('express')
const router = express.Router()
const { homeSandBox, sandboxCreate, GetAll, singleData, deleteData,updateData } = require("../controllers/sandBoxController")

router.get("/", homeSandBox)
router.get("/all", GetAll)
router.post("/create", sandboxCreate)
router.get("/:id", singleData)
router.delete("/del/:id", deleteData)
router.put("/update/:id", updateData)


module.exports = router;
