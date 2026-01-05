import express from "express"

// change made in test branch

import { deleteUser, getAllUsers, getUser, login, logout, register, saveCart, updateUser } from "../controller/auth.js"
import { LoginCheck } from "../middleware/Auth.js"
import { upload } from "../middleware/upload.js"

const router = express.Router()

router.post("/login", login)
router.post("/register", register)
router.post("/logout", LoginCheck, logout)
router.get("/getUser", LoginCheck, getUser)
router.put("/updateUser", LoginCheck, upload.single('profileImage'), updateUser)
router.post("/saveCart", LoginCheck, saveCart)

// Admin Routes
router.get("/admin/users", LoginCheck, getAllUsers)
router.delete("/admin/users/:id", LoginCheck, deleteUser)


export default router