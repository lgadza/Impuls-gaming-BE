import sgMail from "@sendgrid/mail";
import { response } from "express";

sgMail.setApiKey(process.env.SENDGRID_KEY);

export const sendRegistrationEmail = async (recipientAddress, userData) => {
  const msg = {
    to: recipientAddress,
    from: process.env.SENDER_EMAIL,
    subject: `${userData.name}! Welcome to Impulsgaming Family!`,
    // text: "Louis kurisei",
    html: `<div><strong>Hello ${userData.name} ${userData.surname} </strong>
    <div>
    <span>Thanks for joining. We're really excited to have you on board. I hope you will enjoy our tournaments and leagues.</span>
    <div><button><a href="https://impulsgaming.vercel.app/sign-in">Login to your Account</a></button></div>
    <span>You can always contact us <a href="tel:794144892">0794-144-892</a> </span>
    </div>
    <span>@impulsgaming</span>
    <div>`,
  };
  console.log(msg);
  await sgMail.send(msg);
  await console.log("email sent ....");
};
