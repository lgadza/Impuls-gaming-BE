import mongoose from "mongoose";
import ReviewsModel from "./reviewModal.js";
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
productSchema.static("findCustomers", async function (query) {
  const total = await this.countDocuments(query.criteria);
  const customer = await this.find(query.criteria, query.options.fields)
    .sort(query.options.sort)
    .skip(query.options.skip)
    .limit(query.options.limit);
  // .populate({
  //   path: "reviews",
  //     select: "firstName lastName",
  // });

  return { total, customer };
});
export default model("customer", productSchema);
