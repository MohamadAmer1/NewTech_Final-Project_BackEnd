import mongoose from "mongoose";
import Appeal from "../models/appeal.js";
import Fine from "../models/fine.js";
import User from "../models/user.js";
import { uploadPhotoToCloudinary } from "../utils/uploadPhotoToCloudinary.js";

export const addOneAppeal = async (req, res) => {
  try {
    const { fineId, reason, description } = req.body ?? {};

    if (!mongoose.isObjectIdOrHexString(fineId)) {
      return res.status(400).json({
        message: "A valid fine ID is required",
      });
    }

    const fine = await Fine.findOne({
      _id: fineId,
      resident: req.user.userId,
    });

    if (!fine) {
      return res.status(404).json({
        message: "Fine not found or it does not belong to you",
      });
    }

    const existingAppeal = await Appeal.exists({ fine: fineId });

    if (existingAppeal) {
      return res.status(409).json({
        message: "An appeal already exists for this fine",
      });
    }

    const resident = await User.findOne({
      _id: req.user.userId,
      role: "RESIDENT",
    }).select("email");

    if (!resident) {
      return res.status(404).json({
        message: "Resident account not found",
      });
    }

    const appeal = new Appeal({
      resident: resident._id,
      fine: fine._id,
      reason,
      description,
      email: resident.email,
      status: "PENDING",
      resolvedAt: null,
    });

    await appeal.validate();

    if (req.file) {
      const uploadResult = await uploadPhotoToCloudinary(req.file.buffer);
      appeal.photoUrl = uploadResult.secure_url;
    }

    await appeal.save();

    return res.status(201).json(appeal);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An appeal already exists for this fine",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid appeal details",
        error: error.message,
      });
    }

    console.error("Error creating appeal:", error);

    return res.status(500).json({
      message: "Could not create the appeal",
    });
  }
};

export const getAppeals = async (req, res) => {
  try {
    let filter;

    if (req.user.role === "STAFF") {
      filter = {};
    } else if (req.user.role === "RESIDENT") {
      filter = { resident: req.user.userId };
    } else {
      return res.status(403).json({
        message: "You cannot access appeals",
      });
    }

    const appeals = await Appeal.find(filter)
      .populate("resident", "name")
      .populate("fine", "licensePlate violationType amount photoUrl status createdAt resolvedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json(appeals);
  } catch (error) {
    console.error("Error loading appeals:", error);

    return res.status(500).json({
      message: "Could not load appeals",
    });
  }
};

export const decideAppeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        message: "Invalid appeal ID",
      });
    }

    if (status !== "ACCEPTED" && status !== "REJECTED") {
      return res.status(400).json({
        message: "Choose ACCEPTED or REJECTED",
      });
    }

    const updatedAppeal = await mongoose.connection.transaction(async (session) => {
      const resolvedAt = new Date();

      const appeal = await Appeal.findOneAndUpdate(
        {
          _id: id,
          status: "PENDING",
        },
        {
          $set: {
            status,
            resolvedAt,
          },
        },
        {
          session,
          returnDocument: "after",
          runValidators: true,
        },
      );

      if (!appeal) {
        const error = new Error("Appeal not found or it has already been decided");
        error.statusCode = 409;
        throw error;
      }

      const fine = await Fine.findOneAndUpdate(
        {
          _id: appeal.fine,
          resident: appeal.resident,
        },
        {
          $set: { resolvedAt },
        },
        {
          session,
          returnDocument: "after",
          runValidators: true,
        },
      );

      if (!fine) {
        const error = new Error("The appeal's fine could not be found");
        error.statusCode = 409;
        throw error;
      }

      return appeal;
    });

    return res.status(200).json(updatedAppeal);
  } catch (error) {
    console.error("Error deciding appeal:", error);

    return res.status(error.statusCode ?? 500).json({
      message: error.statusCode ? error.message : "Could not save the appeal decision",
    });
  }
};
