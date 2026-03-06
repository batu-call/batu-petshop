import express from "express"
import { isUserAuthenticated } from "../Middlewares/Auth.js"
import { addFavorite, clearFavorites, getFavorite, removeFavorite } from "../Controller/favoriteController.js"
import { favoriteLimiter } from "../Middlewares/Ratelimiter.js"


    const router = express.Router()


router.post("/add",isUserAuthenticated,favoriteLimiter,addFavorite)
router.get("/",isUserAuthenticated,getFavorite)
router.delete("/clear", isUserAuthenticated,favoriteLimiter, clearFavorites);
router.delete("/remove/:productId",isUserAuthenticated,favoriteLimiter,removeFavorite)


export default router