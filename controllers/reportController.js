import cloudinary from "../config/cloudinary.js";
import Report from "../models/report.js";

const uploadPhotoToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });

    uploadStream.on("error", (error) => {
      reject(error);
    });
    uploadStream.end(buffer);
  });
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find();
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
    const report = await Report.findById(req.params.id);
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

export const addOneReport = async (req, res) => {
  try {
    const { name, phone, title, description, category, location, licensePlate, priority, status } = req.body;

    let photoUrl = "";

    if (req.file) {
      try {
        const uploadResult = await uploadPhotoToCloudinary(req.file.buffer);
        photoUrl = uploadResult.secure_url;
      } catch (err) {
        console.error("There is no photo acquainted", err.message);
      }
    }

    const newReport = await Report.create({
      name,
      phone,
      title,
      description,
      category,
      location,
      licensePlate,
      priority,
      status,
      photoUrl,
    });

    return res.status(201).json(newReport);
  } catch (err) {
    return res.status(400).json({
      message: "Error adding report",
      error: err.message,
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

export const deleteOneReport = async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) {
      return res.status(404).json({ message: "There is no such report with this id" });
    }
    res.status(200).json({ message: "song deleted successfully!" }, deletedReport);
  } catch (err) {
    res.status(404).json({
      message: "Error deleting Report",
      error: err.message,
    });
  }
};
