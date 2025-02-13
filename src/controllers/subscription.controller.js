import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscriptions } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription (Subscribe/Unsubscribe)
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user.id; // Authenticated user

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (userId === channelId) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const existingSubscription = await Subscriptions.findOne({
        subscriber: userId,
        channel: channelId,
    });

    if (existingSubscription) {
        // Unsubscribe (Remove from subscriptions)
        await existingSubscription.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed successfully"));
    } else {
        // Subscribe (Add new subscription)
        await Subscriptions.create({
            subscriber: userId,
            channel: channelId,
        });
        return res.status(201).json(new ApiResponse(201, {}, "Subscribed successfully"));
    }
});

// Get subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscriptions.find({ channel: channelId }).populate("subscriber", "username email");

    res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});

// Get channels a user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const subscriptions = await Subscriptions.find({ subscriber: userId }).populate("channel", "username email");

    res.status(200).json(new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
