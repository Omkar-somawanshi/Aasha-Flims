// // import twilio from "twilio";

// const accountSid = 'your_account_sid'; // Twilio Account SID
// const authToken = 'your_auth_token';   // Twilio Auth Token
// const client = twilio(accountSid, authToken);

// const sendWhatsAppOTP = async (to, otp) => {
//     try {
//         const message = await client.messages.create({
//             body: `Your verification code is: ${otp}`,
//             from: 'whatsapp:+14155238886', // Twilio Sandbox or approved WhatsApp number
//             to: `whatsapp:${to}`,
//         });
//         console.log("Message sent:", message.sid);
//     } catch (error) {
//         console.error("Error sending message:", error);
//     }
// };

// sendWhatsAppOTP("+91XXXXXXXXXX", "123456");
