import mongoose from "mongoose";
import bcrypt from "bcrypt";
import requestSchema from "../friendRequest/model.js";
const { Schema, model } = mongoose;

export const UsersSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    avatar: {
      type: String,
      required: false,
      default:
        "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_960_720.png",
    },
    password: { type: String, required: false },
    emailVerified: { type: Boolean, default: false },
    terms: { type: Boolean, required: false },
    area: { type: String },
    bio: { type: String },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    connections: { pending: [requestSchema], active: [] },
    nickname: { type: String },
    organization: { type: String, default: "Impuls Gaming" },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);

UsersSchema.pre("save", async function (next) {
  const currentUser = this;

  if (currentUser.isModified("password")) {
    const plainPW = currentUser.password;

    const hash = await bcrypt.hash(plainPW, 11);
    currentUser.password = hash;
  }

  next();
});

UsersSchema.methods.toJSON = function () {
  const userDocument = this;
  const user = userDocument.toObject();

  delete user.password;
  delete user.createdAt;
  delete user.updatedAt;
  delete user.__v;
  return user;
};

UsersSchema.static("checkCredentials", async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

export default model("User", UsersSchema);
