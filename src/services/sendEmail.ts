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
    


 