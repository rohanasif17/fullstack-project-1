import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
    getAllTweets,
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/createTweet").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/").get(getAllTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router