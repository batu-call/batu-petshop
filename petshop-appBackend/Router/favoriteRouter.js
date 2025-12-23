import express from "express"
import { isUserAuthenticated } from "../Middlewares/Auth.js"
import { addFavorite, getFavorite, removeFavorite } from "../Controller/favoriteController.js"


    const router = express.Router()


router.post("/add",isUserAuthenticated,addFavorite)
router.get("/",isUserAuthenticated,getFavorite)
router.delete("/remove/:productId",isUserAuthenticated,removeFavorite)


export default router