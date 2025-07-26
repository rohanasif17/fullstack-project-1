import mongoose from "mongoose";
async function connectDB() {
         try{
            const dbconnection = await mongoose.connect(process.env.MONGODB_URL);
            console.log("Connected to MongoDB",dbconnection.connection.host);
   }
        catch(error){
            console.log(error);
   }
}

export default connectDB
