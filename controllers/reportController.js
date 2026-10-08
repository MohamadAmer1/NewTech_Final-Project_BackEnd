import Report from "../models/report.js";
import User from "../models/user.js";
import { uploadPhotoToCloudinary } from "../utils/uploadPhotoToCloudinary.js";
import mongoose from "mongoose";

export const getAllReports = async (req, res) => {
  try {
    const filter = req.user.role === "RESIDENT" ? { resident: req.user.userId } : {};

    const reports = await Report.find(filter).populate("resident", "name").sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) {
    res.status(404).json({
      message: "Error getting Reports",
      error: err.message,
    });
  }
};

export const getOneReportById = async (req, res) => {
  try {
    const filter = req.user.role === "RESIDENT" ? { _id: req.params.id, resident: req.user.userId } : { _id: req.params.id };

    const report = await Report.findOne(filter);
    if (!report) {
      return res.status(404).json({
        message: "Report Not Found",
      });
    }
    res.status(200).json(report);
  } catch (err) {
    res.status(404).json({
      message: "Error getting Reports",
      error: err.message,
    });
  }
};

export const getFieldGuards = async (req, res) => {
  try {
    const guards = await User.find({ role: "FIELD_GUARD" }).select("_id name").sort({ name: 1 });

    return res.status(200).json(guards);
  } catch (error) {
    return res.status(500).json({
      message: "Could not load field guards",
    });
  }
};

export const addOneReport = async (req, res) => {
  try {
    const { phone, description, category, location } = req.body;
    let photoUrl = "";

    if (req.file) {
      if (req.file) {
        const uploadResult = await uploadPhotoToCloudinary(req.file.buffer);
        photoUrl = uploadResult.secure_url;
      }
    }

    const newReport = await Report.create({
      resident: req.user.userId,
      assignedFieldGuard: null,
      phone,
      description,
      category,
      location,
      status: "NEW",
      photoUrl,
      resolvedAt: null,
    });

    return res.status(201).json(newReport);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid report details",
        error: err.message,
      });
    }

    console.error("Error creating report:", err);

    return res.status(500).json({
      message: "Could not create the report",
    });
  }
};

export const updateOneReport = async (req, res) => {
  try {
    const updatedReport = await Report.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after", runValidators: true });
    if (!updatedReport) {
      return res.status(400).json({ message: "There is no such report with this id" });
    }
    res.status(201).json(updatedReport);
  } catch (err) {
    res.status(404).json({
      message: "Error updating Report",
      error: err.message,
    });
  }
};

export const uploadFieldGuardPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        message: "Invalid report ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a photo",
      });
    }

    const filter = {
      _id: id,
      assignedFieldGuard: req.user.userId,
    };

    const report = await Report.findOne(filter);

    if (!report) {
      return res.status(404).json({
        message: "Report not found or not assigned to you",
      });
    }

    const uploadResult = await uploadPhotoToCloudinary(req.file.buffer);

    const updatedReport = await Report.findOneAndUpdate(
      filter,
      {
        $set: {
          fieldGuardPhotoUrl: uploadResult.secure_url,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updatedReport) {
      return res.status(409).json({
        message: "Report was removed or its assignment changed",
      });
    }

    return res.status(200).json(updatedReport);
  } catch (error) {
    console.error("Error uploading field guard photo:", error);

    return res.status(500).json({
      message: "Could not save the field guard photo",
    });
  }
};

export const deleteOneReport = async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) {
      return res.status(404).json({ message: "There is no such report with this id" });
    }
    return res.status(200).json({
      message: "Report deleted successfully",
    });
  } catch (err) {
    res.status(404).json({
      message: "Error deleting Report",
      error: err.message,
    });
  }
};

export const assignReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTeam, fieldGuardId } = req.body ?? {};

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        message: "Invalid report ID",
      });
    }

    if (!["FIELD_GUARD", "MAINTENANCE"].includes(assignedTeam)) {
      return res.status(400).json({
        message: "Choose a field guard or maintenance",
      });
    }

    let assignedFieldGuard = null;

    if (assignedTeam === "FIELD_GUARD") {
      if (!mongoose.isObjectIdOrHexString(fieldGuardId)) {
        return res.status(400).json({
          message: "Choose a valid field guard",
        });
      }

      const guard = await User.findOne({
        _id: fieldGuardId,
        role: "FIELD_GUARD",
      });

      if (!guard) {
        return res.status(404).json({
          message: "Field guard not found",
        });
      }

      assignedFieldGuard = guard._id;
    }

    const report = await Report.findOneAndUpdate(
      {
        _id: id,
        status: "NEW",
        assignedFieldGuard: null,
        assignedTeam: null,
      },
      {
        $set: {
          assignedTeam,
          assignedFieldGuard,
          status: "DISPATCHED",
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!report) {
      const exists = await Report.exists({ _id: id });

      return res.status(exists ? 409 : 404).json({
        message: exists ? "This report is already assigned or is no longer new" : "Report not found",
      });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error("Error assigning report:", error);

    return res.status(500).json({
      message: "Could not assign the report",
    });
  }
};

export const updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        message: "Invalid report ID",
      });
    }

    if (status !== "IN PROGRESS" && status !== "RESOLVED") {
      return res.status(400).json({
        message: "Choose IN PROGRESS or RESOLVED",
      });
    }

    const previousStatus = status === "IN PROGRESS" ? "DISPATCHED" : "IN PROGRESS";

    const report = await Report.findOneAndUpdate(
      {
        _id: id,
        assignedTeam: "MAINTENANCE",
        status: previousStatus,
      },
      {
        $set: {
          status,
          resolvedAt: status === "RESOLVED" ? new Date() : null,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!report) {
      const exists = await Report.exists({ _id: id });

      return res.status(exists ? 409 : 404).json({
        message: exists ? "Report is not assigned to maintenance or its stage has changed. Refresh the page." : "Report not found",
      });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error("Error updating maintenance status:", error);

    return res.status(500).json({
      message: "Could not update the report",
    });
  }
};

export const rejectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body ?? {};

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        message: "Invalid report ID",
      });
    }

    if (typeof rejectionReason !== "string" || !rejectionReason.trim()) {
      return res.status(400).json({
        message: "A rejection reason is required",
      });
    }

    const report = await Report.findOneAndUpdate(
      {
        _id: id,
        status: "NEW",
        assignedTeam: null,
        assignedFieldGuard: null,
      },
      {
        $set: {
          status: "REJECTED",
          rejectionReason: rejectionReason.trim(),
          resolvedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!report) {
      const exists = await Report.exists({ _id: id });

      return res.status(exists ? 409 : 404).json({
        message: exists ? "Only new, unassigned reports can be rejected" : "Report not found",
      });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error("Error rejecting report:", error);

    return res.status(500).json({
      message: "Could not reject the report",
    });
  }
};
