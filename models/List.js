import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
  name: { type: String, required: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: "Board" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("List", listSchema);