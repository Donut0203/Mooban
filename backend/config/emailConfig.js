const nodemailer = require('nodemailer');

// Create a transporter object
let transporter;

try {
  // For Gmail, we'll use a more reliable configuration
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'mooban.system@gmail.com',
      pass: process.env.EMAIL_PASS || 'xvog bnvl rvxs rvxs' // App password for Gmail
    },
    debug: true, // Show debug output
    logger: true // Log information about the mail
  });

  // Verify connection configuration
  transporter.verify(function(error, success) {
    if (error) {
      console.error('SMTP connection error:', error);
    } else {
      console.log('SMTP server is ready to take our messages');
    }
  });

  console.log('Email transporter created successfully');
} catch (error) {
  console.error('Error creating email transporter:', error);
  // Create a dummy transporter that logs but doesn't send
  transporter = {
    sendMail: (options) => {
      console.log('Would send email:', options);
      return Promise.resolve({ messageId: 'dummy-id' });
    }
  };
}

// Function to send email
const sendEmail = async (to, subject, html) => {
  try {
    // Always log email details for debugging
    console.log('Sending email:');
    console.log('To:', to);
    console.log('Subject:', subject);

    // Send email
    try {
      const info = await transporter.sendMail({
        from: `"Mooban System" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
        to: to,
        subject: subject,
        html: html
      });

      console.log('Email sent successfully!');
      console.log('Message ID:', info.messageId);

      // Only try to get test message URL if it's a real nodemailer transport
      if (info && nodemailer.getTestMessageUrl && typeof nodemailer.getTestMessageUrl === 'function') {
        try {
          console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        } catch (previewError) {
          console.log('Could not generate preview URL');
        }
      }
    } catch (sendError) {
      console.error('Error in transporter.sendMail:', sendError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // Log detailed error information
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
    return false;
  }
};

module.exports = { sendEmail };const nodemailer = require('nodemailer');
