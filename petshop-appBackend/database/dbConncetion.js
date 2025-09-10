import mongoose from "mongoose"


    export const dbConncetion = () => {
        mongoose.connect(process.env.MONGO_URI,{
            dbName:"Batu_Petshop_App"
        }).then(() => {
            console.log("Conncetion to Database")
        }).catch((err) => {
            console.log(`some error occured while connecting to database: ${err}`)
        })
    }