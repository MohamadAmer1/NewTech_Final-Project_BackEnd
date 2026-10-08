import novu from "../config/novu.js";
import User from "../models/user.js";

export const notifyFieldGuardAboutReport = async (report) => {
  const fieldGuardMembers = await User.find({ role: "FIELD_GUARD" })
    .select("_id")
    .lean();

  for (const fieldGuard of fieldGuardMembers) {
    try {
      await novu.trigger({
        workflowId: "report-created",

        to: {
          subscriberId: fieldGuard._id.toString(),
        },

        payload: {
          reportId: report._id.toString(),
          title: report.title,
          location: report.location,
          priority: report.priority,
        },
      });
    } catch (error) {
      console.error(
        `Could not trigger notification for field guard ${fieldGuard._id}:`,
        error.message,
      );
    }
  }
};