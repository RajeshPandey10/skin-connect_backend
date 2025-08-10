import { Appointment } from "../models/appointmentModel.js";
import Specialist from "../models/specialistModel.js";
import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import sendEmail from "../utils/sendEmail.js";

const registerAppointment = asyncHandler(async (req, res) => {
  // Register an appointment

  const { specialist, time } = req.body;
  console.log(specialist, time);

  if (!specialist || !time) {
    throw new ApiError(400, "All the details are required");
  }

  console.log("specialist", specialist);

  let appointmentExistedInSameTime = await Appointment.findOne({
    specialist,
    time,
    status:"accepted"
  });

  if (appointmentExistedInSameTime) {
    throw new ApiError(400, "Appointment already exists");
  }


  let appointmentExisted = await Appointment.findOne({
    specialist,
    patient: req.user._id,
  });

  if (appointmentExisted) {
    throw new ApiError(400, "Appointment already exists");
  }

  const appointment = await Appointment.create({
    specialist,
    time,
    patient: req.user._id,
  });

  const specialistDetail = await User.findOne({
    _id: appointment.specialist,
  }).select("email name");

  sendEmail({
    email: specialistDetail?.email,
    subject: "Regarding Appointment",
    message: `Hello Mr. ${specialistDetail.name}, You have a new appointment registered`,
  });

  console.log(specialistDetail);

  if (!appointment) {
    throw new ApiError(400, "Error occured while registering Appointment ");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, appointment, "Appointment registered suscessfully")
    );
});

const getSpecialistAppointment = asyncHandler(async (req, res) => {
  // Get specialist appointment
  const { id } = req.params;
  console.log("Entered here");

  // console.log(id);

  if (!id) {
    throw new ApiError(400, "Id is required");
  }

  const appointment = await Appointment.find({ specialist: id }).populate(
    "patient",
    "name"
  );

  // console.log(appointment);

  if (!appointment) {
    throw new ApiError(400, "Error occured while fetching  appointing");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, appointment, "Suscessfully fetched appointments")
    );
});

const getPatientAppointment = asyncHandler(async (req, res) => {
  // Get the appointment of the user
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id is required");
  }

  const appointment = await Appointment.find({ patient: id }).populate(
    "specialist",
    "name"
  );


  return res
    .status(200)
    .json(
      new ApiResponse(200, appointment, "Appointment fetched suscessfully")
    );
});

const deleteAppointment = asyncHandler(async (req, res) => {
  // Delete appointment
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id is required");
  }
  const appointment = await Appointment.findByIdAndDelete(id);

  if (!appointment) {
    throw new ApiError(400, "Something went wrong");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, appointment, "Appointment deleted suscessfully")
    );
});

const acceptAppointment = asyncHandler(async (req, res) => {
  // Accept the appointment
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Id is required");
  }
  const appointment = await Appointment.findByIdAndUpdate(id, {
    status: "accepted",
  }).populate("patient", "name email");

  console.log("Appointment", appointment);

  if (!appointment) {
    throw new ApiError(400, "Something went wrong while accepting negotiation");
  }

  sendEmail({
    email: appointment?.patient?.email,
    subject: `Regarding Appointment`,
    message: `Dear ${appointment?.patient?.name}, Your appointment has been accepted`,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, appointment, "Appointment accepted suscessfully")
    );
});
const rejectAppointment = asyncHandler(async (req, res) => {
  // Accept the appointment
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Id is required");
  }
  const appointment = await Appointment.findByIdAndUpdate(id, {
    status: "rejected",
  }).populate("patient", "email name");

  if (!appointment) {
    throw new ApiError(400, "Something went wrong while accepting negotiation");
  }

  console.log("Reject",appointment);
  

  sendEmail({
    email: appointment?.patient?.email,
    subject: "Regarding Appointment",
    message: `Dear ${appointment?.patient?.name}, Your appointment has been rejected`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, appointment, "Something went wrong")); 
});

const getIdOfSpecialist = asyncHandler(async(req,res)=>{
  // Get the user Id
  
  const {id} = req.params;
  
  
  
  const specialist = await Specialist.findOne({specialist:id});
  
  console.log("entered here 22",specialist); 
  return res
  .status(200)
  .json(new ApiResponse(200,specialist,"Suscessfullly fetched specialist data"))

})

export {
  registerAppointment,
  deleteAppointment, 
  acceptAppointment,
  getPatientAppointment,
  getSpecialistAppointment,
  rejectAppointment,
  getIdOfSpecialist
};
