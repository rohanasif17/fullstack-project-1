import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,  {
                resource_type: 'auto'
        })
        // console.log('file has been uploaded on cloudinary', response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // when the file didnt uploaded
        return null
    }
}

const deleteFromCloudinary = async (publicId, resource_type="image") => {
    try {
        if (!publicId) return null;
        return await cloudinary.uploader.destroy(publicId, {resource_type});
    } catch (error) {
        return null;
    }
}

const extractPublicId = (url) => {
    const parts = url.split("/");
    const publicIdWithExtension = parts[parts.length - 1];
    const publicId = publicIdWithExtension.split(".")[0];
    return publicId;
}

export { uploadOnCloudinary, deleteFromCloudinary, extractPublicId }
