import { Query } from "../models/queriesModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUserQuery = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    throw new ApiError(400, "ALl the fields are required");
  }

  const query = await Query.create({ name, email, message });

  if (!query) {
    throw new ApiError(400, "Something went wrong");
  }

  return res.status(200).json(new ApiResponse(200, query, "Query REgistered suscessfully"));
});

const deleteQuery = asyncHandler(async (req, res) => {
  const { id } = req.query;
  if (!id) {
    throw new ApiError(400, "Id is required");
  }
  const query = await Query.findByIdAndDelete(id);

  if (!query) {
    throw new ApiError(400, "Something went wrong while deleting");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, query, "Suscessfully deleted"));
});

const getAllQuery = asyncHandler(async(req,res)=>{
    const query = await Query.find({});

    if(!query){
        throw new ApiError(400,"No queries are found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,query,"All the queries are fetched"));
})

export { registerUserQuery, deleteQuery ,getAllQuery};
