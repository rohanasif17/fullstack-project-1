import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {User} from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    console.log("Creating playlist for user:", req.user?._id);
    console.log("Playlist data:", { name, description });

    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    const playlist = await Playlist.create({
        name,
        description: description || "",
        owner: req.user?._id,
        videos: []
    });

    console.log("Created playlist:", playlist);

    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const playlists = await Playlist.find({ owner: userId }).populate({
        path: "videos",
        populate: {
            path: "owner",
            select: "fullName username avatar"
        }
    });

    // Do not throw a 404 if playlists is empty; always return an array
    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
})

const getCurrentUserPlaylists = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "User not authenticated");
    }
    
    // First, let's check if the user exists
    const user = await User.findById(req.user?._id);
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    const playlists = await Playlist.find({ owner: req.user?._id }).populate({
        path: "videos",
        populate: {
            path: "owner",
            select: "fullName username avatar"
        }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "Current user playlists fetched successfully"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    // First get the playlist to get the video IDs
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Use aggregation to get videos with like information
    const videosWithLikes = await Video.aggregate([
        {
            $match: {
                _id: { $in: playlist.videos.map(id => new mongoose.Types.ObjectId(id)) }
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

    // Create the response object with videos that include like information
    const playlistWithVideos = {
        ...playlist.toObject(),
        videos: videosWithLikes
    };

    return res
        .status(200)
        .json(new ApiResponse(200, playlistWithVideos, "Playlist fetched successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to add videos to this playlist");
    }

    if (playlist.videos.includes(videoId)) {
        return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Video already exists in the playlist"));
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $push: { videos: videoId } },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to add video to playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to remove videos from this playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to remove video from playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"));
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this playlist");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
        throw new ApiError(500, "Failed to delete playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description: description || playlist.description
            }
        },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to update playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getCurrentUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}