import nodemailer from "nodemailer";



export const sendOTPmail = async(email:string,otp:number)=>{
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "murshidm2x@gmail.com",
          pass: process.env.MAILER,
        },
      });

      const mailOptions: nodemailer.SendMailOptions = {
        from: "murshidm2x@gmail.com",
        to: email,
        subject: "CoDesk Email Verification",
        text: `${email},your verification code is: ${otp}`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
      } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Error sending OTP email');
      }
}

export const sendInvitationEmail = async(email: string, token: string)=>{
  const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "murshidm2x@gmail.com",
        pass: process.env.MAILER,
      },
    });
    const invitationLink = `${process.env.CORS_URL}/accept-invitation?token=${token}`;
    const mailOptions: nodemailer.SendMailOptions = {
      from: "murshidm2x@gmail.com",
      to: email,
      subject: "You have been invited to a workspace!",
      text: `Click the link below to join the workspace:\n${invitationLink} This link will expire in 48 hrs`,
      html: `
      <p>You've been invited to join a workspace! Click the button below to accept the invitation:</p>
      <a href="${invitationLink}" style="text-decoration: none;">
        <button style="
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 10px 0;
          cursor: pointer;
          border: none;
          border-radius: 5px;">
          Join Workspace
        </button>
      </a>
    `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("invite sented");
      
    } catch (error) {
      console.error('Error sending invite email:', error);
      throw new Error('Error sending invite email');
    }
}
    


 