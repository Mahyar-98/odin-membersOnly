const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  membership_status: {
    type: String,
    enum: ["user", "member", "admin"],
    default: "user",
    required: true,
  },
});

UserSchema.virtual("name").get(() => {
  return `${this.first_name} ${this.last_name}`;
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
