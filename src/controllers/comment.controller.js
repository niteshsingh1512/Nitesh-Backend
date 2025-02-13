import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ Get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const comments = await Comment.find({ video: videoId })
        .populate("user", "username profilePicture") // Populate user details
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip((page - 1) * limit)
        .limit(Number(limit));

    res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

// ✅ Add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // Extracted from `verifyJWT` middleware

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    const newComment = new Comment({
        user: userId,
        video: videoId,
        content
    });

    await newComment.save();

    res.status(201).json(new ApiResponse(201, newComment, "Comment added successfully"));
});

// ✅ Update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.user.toString() !== userId) {
        throw new ApiError(403, "Unauthorized: Cannot edit this comment");
    }

    comment.content = content || comment.content;
    await comment.save();

    res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
});

// ✅ Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.user.toString() !== userId) {
        throw new ApiError(403, "Unauthorized: Cannot delete this comment");
    }

    await comment.deleteOne();

    res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
