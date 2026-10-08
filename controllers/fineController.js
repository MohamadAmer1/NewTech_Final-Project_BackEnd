import mongoose from "mongoose";
import Fine from "../models/fine.js";
import User from "../models/user.js";
import Vehicle from "../models/vehicle.js";

import { uploadPhotoToCloudinary } from "../utils/uploadPhotoToCloudinary.js";
import { normalizeLicensePlate } from "../utils/normalizeLicensePlate.js";

export const addOneFine = async (req, res) => {
  try {
    const { licensePlate: submittedPlate, violationType, amount } = req.body ?? {};

    const licensePlate = normalizeLicensePlate(submittedPlate);

    if (!licensePlate) {
      return res.status(400).json({
        message: "A license plate is required",
      });
    }

    const vehicle = await Vehicle.findOne({ licensePlate });

    if (!vehicle) {
      return res.status(404).json({
        message: "No vehicle found with this license plate",
      });
    }

    const resident = await User.findOne({
      _id: vehicle.resident,
      role: "RESIDENT",
    });

    if (!resident) {
      return res.status(404).json({
        message: "Vehicle owner not found",
      });
    }
    const fine = new Fine({
      fieldGuard: req.user.userId,
      resident: resident._id,
      licensePlate: vehicle.licensePlate,
      violationType,
      amount,
      status: "UNPAID",
      resolvedAt: null,
    });

    await fine.validate();

    if (req.file) {
      const uploadResult = await uploadPhotoToCloudinary(req.file.buffer);
      photoUrl = uploadResult.secure_url;
    }
    await fine.save();

    return res.status(201).json(fine);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid fine details",
        error: error.message,
      });
    }

    console.error("Error creating fine:", error);

    return res.status(500).json({
      message: "Could not create the fine",
    });
  }
};

export const getMyFines = async (req, res) => {
  try {
    let filter;

    if (req.user.role === "FIELD_GUARD") {
      filter = { fieldGuard: req.user.userId };
    } else if (req.user.role === "RESIDENT") {
      filter = { resident: req.user.userId };
    } else {
      return res.status(403).json({
        message: "You cannot access fines",
      });
    }

    const fines = await Fine.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(fines);
  } catch (error) {
    console.error("Error getting fines:", error);

    return res.status(500).json({
      message: "Could not load fines",
    });
  }
};
