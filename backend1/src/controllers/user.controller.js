import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findOne(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave : false })
        return{accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}
const registerUser = asyncHandler( async (req, res)=>{

        // get user details from frontend
        const {email, username, password, fullName} = req.body

        // validation - not empty, @ present in email            FUTURE: ADD CHECKS FOR PASSWORD AND USERNAME
        if (  [email, username, password, fullName].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required")
        }
        if (!email.includes('@')) {
            throw new ApiError(400, "Email must contain an '@' symbol.")
        }

        if (username?.includes(" ")) {
            throw new ApiError(400, "Username cannot contain spaces")
        }

        // check if user already exists: username, email
        const existedUser = await User.findOne({
            $or : [{ email },{ username }]
        })
        if (existedUser) {
            throw new ApiError(409, "User with this Email or Username already exists!")
        }

        // check for images, check for avatar
        const avatarLocalPath = req?.files?.avatar?.[0]?.path
        const coverImageLocalPath =  req?.files?.coverImage?.[0]?.path;
        
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required")
        }
        
        // upload them to cloudinary, check avatar
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!avatar) {
            throw new ApiError(400, "Avatar file is required")
        }
        
        // create user object create entry in db
        let user;
        try {
            user = await User.create({
                fullName,
                avatar: { url: avatar.url, public_id: avatar.public_id },
                coverImage: coverImage?.url ? { url: coverImage.url, public_id: coverImage.public_id } : undefined,
                username : username.toLowerCase(),
                email,
                password
            })
        } catch (err) {
            // Clean up uploaded images if user creation fails
            if (avatar?.public_id) await deleteFromCloudinary(avatar.public_id, "image")
            if (coverImage?.public_id) await deleteFromCloudinary(coverImage.public_id, "image")
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        // remove password and refresh token field from response
        const createdUser = await User.findById(user.id).select(
            "-password -refreshToken"
        )
        
        // check for user creation
        if (!createdUser) {
            // Clean up uploaded images if user not found after creation
            if (avatar?.public_id) await deleteFromCloudinary(avatar.public_id, "image")
            if (coverImage?.public_id) await deleteFromCloudinary(coverImage.public_id, "image")
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        // return res
        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )

})
const loginUser = asyncHandler( async (req, res) => {
    // Check if user is already logged in by checking cookies
    
    // if (req.cookies && req.cookies.accessToken && req.cookies.refreshToken) {
    //     throw new ApiError(400, "User is already logged in.");
    // }

    //req body ==> data
    //valitions - fields not empty
    //check if user exists or not (if not then told user to register if they havent)
    // if exists ==> get refresh token from database
    //compare tokens 
    //give access to user (to use the website)


    // req body -> data
    const {email, username, password} = req.body

    
    // username or email
    if (!(email || username)) {
        throw new ApiError(400,"Username or Email is required!")
    }

    //find the user
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    
    //password check
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect User credentials")
    }
    
    //access and referesh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

    //send cookie
    const options = {
        httpOnly: true,
        secure: true
    }
    
        res
        .status(200)
        .cookie('accessToken', accessToken , options)
        .cookie('refreshToken', refreshToken , options)
        .json(new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
            } , 'User logged in successfully'))
})
const logoutUser = asyncHandler( async (req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset : {refreshToken : 1}
        },
        {
            new : true
        }
    ) 
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json( new ApiResponse(200), {}, 'User logged out successfully')
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})
const changeCurrentPassword = asyncHandler(async(req, res) =>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, 'Invalid old Password')
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})
const getCurrentUser = asyncHandler( async (req, res) =>{
    res.status(200).json(new ApiResponse(200, req.user, 'current User data fetched successfully'))
})
const updateAccountDetails = asyncHandler(async(req, res) => {
    const { fullName, username, email } = req.body;

    if (username?.includes(" ")) {
        throw new ApiError(400, "Username cannot contain spaces")
    }

    // Build update object dynamically
    const updateData = {};
    if (fullName && fullName.trim() !== "") updateData.fullName = fullName;
    if (username && username.trim() !== "") updateData.username = username.toLowerCase();
    if (email && email.trim() !== "") updateData.email = email;

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "At least one field (fullName, username, or email) must be provided to update");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: updateData
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});
const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    // Remove previous avatar from Cloudinary if it exists
    const user = await User.findById(req.user?._id)
    if (user?.avatar?.public_id) {
        await deleteFromCloudinary(user.avatar.public_id, "image")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: { url: avatar.url, public_id: avatar.public_id }
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedUser, "Avatar image updated successfully")
    )
})
const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    // Remove previous cover image from Cloudinary if it exists
    const user = await User.findById(req.user?._id)
    if (user?.coverImage?.public_id) {
        await deleteFromCloudinary(user.coverImage.public_id, "image")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on cover image")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: { url: coverImage.url, public_id: coverImage.public_id }
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedUser, "Cover image updated successfully")
    )
})
const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})
const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}