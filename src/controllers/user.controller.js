import { asyncHandler } from "../utlis/asyncHandler.js";

const registerUser = asyncHandler( async (req, res)=>{
    res.status(200).json({
        message : 'ok'
    })
})
const loginUser = asyncHandler(async (req, res) =>{
    res.status(200).json({
        message: "An error occured!",
    })
})
const signupUser = asyncHandler( async (req,res)=>{
    res.status(200).json({
        message : 'Enter Your Email'
    })
})

export {registerUser, loginUser, signupUser}