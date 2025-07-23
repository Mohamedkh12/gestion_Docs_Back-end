const nodemailer = require('nodemailer');
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: 'src/config/.env' });

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});


const sendInvitation = async (toEmail, inviterName, invitationLink) => {
    const mailOptions = {
        from: `"Espace Collaboratif" <${process.env.MAIL_FROM}>`,
        to: toEmail,
        subject: 'Invitation à collaborer',
        html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h2 style="color: #2563eb;">Invitation à collaborer</h2>
    <p>${inviterName} vous invite à rejoindre l'espace collaboratif sur notre plateforme.</p>
    <div style="margin: 20px 0;">
      <a href="${invitationLink}" 
         style="background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
         Accepter l'invitation
      </a>
    </div>
    <p><b>Note:</b> Ce lien expire dans 48 heures et ne peut être utilisé qu'une seule fois.</p>
    <p style="font-size: 12px; color: #6b7280;">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur:<br>
      ${invitationLink}
    </p>
  </div>
`

    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendInvitation };
