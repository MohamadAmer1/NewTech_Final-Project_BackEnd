import Vehicle from "../models/vehicle.js";
import User from "../models/user.js";
import { normalizeLicensePlate } from "../utils/normalizeLicensePlate.js";

export const findVehicleOwner = async (req, res) => {
  try {
    const licensePlate = normalizeLicensePlate(
      req.query.licensePlate,
    );

    if (!licensePlate) {
      return res.status(400).json({
        message: "Please provide a license plate",
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
    }).select("_id name");

    if (!resident) {
      return res.status(404).json({
        message: "Vehicle owner not found",
      });
    }

    return res.status(200).json({
      licensePlate: vehicle.licensePlate,
      resident: {
        id: resident._id,
        name: resident.name,
      },
    });
  } catch (error) {
    console.error("Error finding vehicle owner:", error);

    return res.status(500).json({
      message: "Could not find the vehicle owner",
    });
  }
};