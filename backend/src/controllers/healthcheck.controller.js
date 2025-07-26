import {ApiResponse} from "../utils/ApiResponse.js"

const healthcheck = (req, res) => {
    //TODO: build a healthcheck response that checks for database connection and other services
    try {
        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Server is healthy and running"));
    } catch (error) {
        return res.status(503).json(new ApiResponse(503, {}, "Server is not healthy"));
    }
}

export {
    healthcheck
    }
    