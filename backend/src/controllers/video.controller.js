import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Like} from "../models/like.model.js"
import ApiError from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFromCloudinary, extractPublicId} from "../utils/cloudinary.js"
import { videoCategories } from "../constants.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, userId, category } = req.query;

    const pipeline = [];

    // Removed search query handling

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
    
    if (category) {
        if (!videoCategories.includes(category)) {
            throw new ApiError(400, "Invalid category");
        }
        pipeline.push({
            $match: {
                category: category
            }
        });
    }

    pipeline.push({
        $match: {
            isPublished: true
        }
    });

    // Added lookup to populate owner details as an array (avatar, fullName, username)
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
    // Flatten owner array to object for consistency
    pipeline.push({
        $addFields: {
            owner: { $first: "$owner" }
        }
    });

    pipeline.push({ $sort: { createdAt: -1 } });

    const videoAggregate = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const videos = await Video.aggregatePaginate(videoAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, category } = req.body;

    if ([title, description, category].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    if (!videoCategories.includes(category)) {
        throw new ApiError(400, "Invalid category");
    }

    // Use optional chaining for array indexing as well to avoid errors when files are missing
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) {
        if(thumbnail){
            const thumbnailPublicId = extractPublicId(thumbnail.url);
            await deleteFromCloudinary(thumbnailPublicId, "image");
        }
        throw new ApiError(500, "Failed to upload video file");
    }

    if (!thumbnail) {
        if(videoFile){
            const videoPublicId = extractPublicId(videoFile.url);
            await deleteFromCloudinary(videoPublicId, "video");
        }
        throw new ApiError(500, "Failed to upload thumbnail");
    }

    const video = await Video.create({
        title,
        description,
        category,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user?._id,
        isPublished: true
    });

    if (!video) {
        throw new ApiError(500, "Failed to create video entry in the database");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const videoAggregate = Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            },
        },
        {
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
                            "avatar.url": 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes",
                },
                // Removed owner flattening to keep it as an array
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
            $project: {
                likes: 0,
            },
        },
    ]);

    const videoResult = await videoAggregate;
    const video = videoResult[0];

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const user = await User.findById(req.user?._id);
    const videoIndex = user.watchHistory.indexOf(videoId);
  
    if (videoIndex > -1) {
      // If video exists in watch history, remove it
      user.watchHistory.splice(videoIndex, 1);
    }
  
    // Add video to the beginning of watch history
    user.watchHistory.unshift(videoId);
  
    await user.save({ validateBeforeSave: false });
    // View counting moved to a dedicated endpoint (POST /videos/:videoId/view)

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    if (!(title && description)) {
        throw new ApiError(400, "Title and description are required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    // if there's a new thumbnail, delete the old one
    if (thumbnailLocalPath && video.thumbnail) {
        const oldThumbnailPublicId = extractPublicId(video.thumbnail);
        await deleteFromCloudinary(oldThumbnailPublicId, 'image');
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail?.url || video.thumbnail
            }
        },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(500, "Failed to update video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    // Delete video and thumbnail from Cloudinary
    if (video.videoFile) {
        const videoPublicId = extractPublicId(video.videoFile);
        await deleteFromCloudinary(videoPublicId, 'video');
    }
    if (video.thumbnail) {
        const thumbnailPublicId = extractPublicId(video.thumbnail);
        await deleteFromCloudinary(thumbnailPublicId, 'image');
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new ApiError(500, "Failed to delete video");
    }

    await Like.deleteMany({ video: videoId });
    await User.updateMany(
        { watchHistory: videoId },
        { $pull: { watchHistory: videoId } }
    );
    

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

// ----------------------------------------------------------------
// Add View Controller
// ----------------------------------------------------------------
// Ensures a view is counted only when:
// 1. The viewer is authenticated and NOT the owner of the video.
// 2. The client explicitly calls this endpoint after either:
//      a) Video ended (full watch), OR
//      b) 30 seconds of playback have elapsed.
// The client-side logic is responsible for determining when this endpoint
// should be triggered.
// ----------------------------------------------------------------

const addView = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    // Fetch only owner + views for minimal payload
    const video = await Video.findById(videoId).select('owner views isPublished');

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (!video.isPublished) {
        throw new ApiError(403, "Cannot view an unpublished video");
    }

    // Do not count views from the owner themselves
    if (video.owner.toString() === req.user?._id.toString()) {
        return res.status(200).json(new ApiResponse(200, { views: video.views }, "Owner view ignored"));
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },
        { new: true, select: 'views' }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, { views: updatedVideo.views }, "View counted"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to toggle publish status for this video");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(500, "Failed to toggle publish status");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Publish status toggled successfully"));
});

// Search videos for search bar
export const searchVideos = asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q || !q.trim()) {
        return res.status(200).json({ results: [] });
    }

    const pipeline = [
        {
            $search: {
                index: "search-videos",
                text: {
                    query: q,
                    path: ["title", "description"]
                }
            }
        },
        { $match: { isPublished: true } },
        { $limit: 10 },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1
            }
        }
    ];

    const results = await Video.aggregate(pipeline);
    const formatted = results.map(v => ({
        title: v.title,
        description: v.description,
        url: `/videos/${v._id}`
    }));
    return res.status(200).json({ results: formatted });
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    addView,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}