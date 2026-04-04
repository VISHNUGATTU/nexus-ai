import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  // 1. Generate the JWT
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // 2. Set it as an HTTP-Only cookie
  res.cookie("token", token, {
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    secure: process.env.NODE_ENV !== "development", // Requires HTTPS in production
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });

  // Return the token just in case your controller needs to send it in the JSON body as well
  return token; 
};

export default generateToken;