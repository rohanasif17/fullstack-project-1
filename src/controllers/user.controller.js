
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || '',
            username : username.toLowerCase(),
            email,
            password
        })

        // remove password and refresh token field from response
        const createdUser = await User.findById(user.id).select(
            "-password -refreshToken"
        )
        
        // check for user creation
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        // return res
        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )

    })

export {registerUser}