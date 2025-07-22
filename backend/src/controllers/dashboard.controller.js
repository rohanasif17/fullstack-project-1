import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import ApiError from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user._id;

    const totalSubscribers = await Subscription.countDocuments({
      channel: userId,
    });

    const videos = await Video.find({ owner: userId });

    if (!videos) {
      throw new ApiError(404, "Vidoes not found");
    }

    const totalVideos = videos.length;

    const totalViews = videos.reduce((acc, video) => acc + video.views, 0);

    const videoIds = videos.map((video) => video._id);

    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalSubscribers,
          totalVideos,
          totalViews,
          totalLikes,
        },
        "Channel stats fetched successfully"
      )
    );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // Get all the videos uploaded by the channel
    const userId = req.user?._id

    const videos = await Video.find({owner: userId})

    if(!videos){
        throw new ApiError(400, "User has not uploaded any video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "Vidoes fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }