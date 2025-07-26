import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {Like} from "../models/like.model.js"
import ApiError from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const {content} = req.body
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if (!tweet) {
        throw new ApiError(500, "Failed to create tweet")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"))


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const tweetAggregate = Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes",
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes",
                },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$likes.likedBy"],
                        },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $project: {
                likes: 0,
            },
        },
    ]);

    const tweets = await tweetAggregate;

    // Remove the 404 error throw for empty tweets
    // Always return an array, even if empty

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required")
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            }
        },
        { new: true }
    )

    if (!updatedTweet) {
        throw new ApiError(500, "Failed to update tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if (!deletedTweet) {
        throw new ApiError(500, "Failed to delete tweet")
    }
    await Like.deleteMany({ tweet: tweetId });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet deleted successfully"))
})

const getAllTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, userId } = req.query;

    const pipeline = [];

    if (query) {
        pipeline.push({
            $search: {
                index: "search-tweets",
                text: {
                    query: query,
                    path: ["content"]
                }
            }
        });
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }

        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    pipeline.push({
        $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "tweet",
            as: "likes",
        },
    });

    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
                {
                    $project: {
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1
                    }
                }
            ]
        }
    });

    pipeline.push({
        $addFields: {
            likesCount: {
                $size: "$likes",
            },
            isLiked: {
                $cond: {
                    if: {
                        $in: [req.user?._id, "$likes.likedBy"],
                    },
                    then: true,
                    else: false,
                },
            },
            owner: { $first: "$owner" }
        },
    });

    pipeline.push({ $sort: { createdAt: -1 } });

    pipeline.push({
        $project: {
            likes: 0,
        },
    });

    const tweetAggregate = Tweet.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const tweets = await Tweet.aggregatePaginate(tweetAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets
}