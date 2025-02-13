import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscriptions } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // ✅ Get the channel statistics like:
    // - Total videos
    // - Total video views
    // - Total subscribers
    // - Total likes across all videos

    const { channelId } = req.params;

    // Validate channelId
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Fetch total number of videos uploaded by the channel
    const totalVideos = await Video.countDocuments({ owner: channelId });

    // Fetch total views across all videos of the channel
    const totalViews = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    // Fetch total subscribers of the channel
    const totalSubscribers = await Subscriptions.countDocuments({ channel: channelId });

    // Fetch total likes across all videos of the channel
    const totalLikes = await Like.countDocuments({ videoOwner: channelId });

    // Construct the response
    const stats = {
        totalVideos,
        totalViews: totalViews.length > 0 ? totalViews[0].totalViews : 0,
        totalSubscribers,
        totalLikes
    };

    res.status(200).json(new ApiResponse(200, stats, "Channel statistics fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // ✅ Get all videos uploaded by the channel with pagination support

    const { channelId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate channelId
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Fetch videos uploaded by the channel with pagination
    const videos = await Video.find({ owner: channelId })
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip((page - 1) * limit)
        .limit(Number(limit));

    res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
