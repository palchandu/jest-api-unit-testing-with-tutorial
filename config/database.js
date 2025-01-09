import mongoose from "mongoose";
const db = "mongodb://localhost:27017/jobs-todo";
const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_LOCAL_URI || db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((con) => {
      console.log(
        `MongoDB Database connected with host: ${con.connection.host}`
      );
    });
};

export default connectDatabase;
