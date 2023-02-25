import sgMail from "@sendgrid/mail";
import { response } from "express";

sgMail.setApiKey(process.env.SENDGRID_KEY);

export const sendRegistrationEmail = async (
  recipientAddress,
  userData,
  userId
) => {
  const msg = {
    to: recipientAddress,
    from: process.env.SENDER_EMAIL,
    subject: ` Verify Your Email Address`,

    html: `<div><strong>Dear ${userData.name} ${userData.surname} </strong>
    <div>
    <span>Thank you for signing up for our service. To ensure the security of your account and the accuracy of your information, we need to verify your email address.

To complete the verification process, please click on the button below:

<div><button><a href="https://impulsgaming.vercel.app/organizer/verifyEmail/${userId}">verify email</a></button></div>

If you are unable to click the button, please copy and paste the link below  into your browser's address bar.

<a href="https://impulsgaming.vercel.app/organizer/verifyEmail/${userId}">verify email</a>

Please note that your account will remain inactive until you complete the verification process. If you have any questions or concerns, please feel free to contact us.

<a href="tel:794144892">0794-144-892</a>

Thank you for your cooperation.

Best regards,

Louis Gadza</span>
    
   
    </div>
    <span>@impulsgaming</span>
    <div>`,
  };
  await sgMail.send(msg);
  await console.log("email sent ....");
};
