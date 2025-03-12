import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true, // prevent XSS attacks cross-site scripting atacks
    secure: process.env.NODE_ENV !== "development", // cookie only works in https
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expires in 7 days
  });

  return token;
};
