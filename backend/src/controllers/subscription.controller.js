import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import ApiError from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    if (channelId === req.user?._id.toString()) {
        throw new ApiError(400, "User cannot subscribe to his own channel")
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    })

    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed?._id)

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {subscribed: false},
                    "unsunscribed successfully"
                )
            )
    }

    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {subscribed: true},
                "subscribed successfully"
            )
        )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    const subscribers = await Subscription.find({
        channel: channelId,
    })

    if (!subscribers) {
        throw new ApiError(404, "channel does not exist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribers,
                "subscribers fetched successfully"
            )
        )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId")
    }

    const subscribedChannels = await Subscription.find({
        subscriber: subscriberId,
    })

    if (!subscribedChannels) {
        throw new ApiError(404, "user does not exist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedChannels,
                "subscribed channels fetched successfully"
            )
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}