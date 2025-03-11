const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    console.log('Upload profile picture request received');

    // ใช้ userId จาก token แทนที่จะใช้จาก params
    const userId = req.userId;
    console.log('Using userId from token:', userId);

    // ตรวจสอบว่า userId จาก token ตรงกับ userId จาก params หรือไม่
    const paramUserId = req.params.userId;
    console.log('Param userId:', paramUserId);

    if (userId !== parseInt(paramUserId)) {
      return res.status(403).json({ message: 'คุณสามารถอัปโหลดรูปโปรไฟล์ได้เฉพาะของตัวเองเท่านั้น' });
    }

    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the image data from the request body
    const { imageData } = req.body;

    let profilePictureUrl;

    // If image data is provided, save it to a file
    if (imageData && imageData.includes('base64')) {
      console.log('Image data format (first 50 chars):', imageData.substring(0, 50) + '...');
      console.log('Image data length:', imageData.length);

      // ตรวจสอบขนาดข้อมูล - เพิ่มขนาดสูงสุดเป็น 50MB
      const maxSizeInBytes = 50 * 1024 * 1024; // 50MB in base64 is approximately 67MB of data
      if (imageData.length > maxSizeInBytes) {
        return res.status(413).json({
          message: `ไฟล์มีขนาดใหญ่เกินไป (ประมาณ ${(imageData.length / (1024 * 1024)).toFixed(2)} MB) กรุณาอัปโหลดไฟล์ขนาดไม่เกิน 50MB`
        });
      }

      // ตรวจสอบว่าข้อมูลไม่ว่างเปล่าหรือมีขนาดเล็กเกินไป
      if (imageData.length < 100) {
        return res.status(400).json({ message: 'ข้อมูลรูปภาพไม่ถูกต้องหรือมีขนาดเล็กเกินไป' });
      }

      // Extract the base64 data (remove the data:image/xxx;base64, prefix)
      // This regex is more permissive to handle various image formats
      let base64Data;
      try {
        // ใช้ regex ที่ยืดหยุ่นมากขึ้นเพื่อรองรับทุกรูปแบบ MIME type
        base64Data = imageData.replace(/^data:.*?;base64,/, '');
      } catch (error) {
        console.error('Error extracting base64 data:', error);
        // If there's an error with the regex, try a simpler approach
        const commaIndex = imageData.indexOf(',');
        if (commaIndex !== -1) {
          base64Data = imageData.substring(commaIndex + 1);
        } else {
          // If all else fails, use the data as is
          base64Data = imageData;
        }
      }

      // Create a unique filename with appropriate extension
      const timestamp = Date.now();

      // Determine file extension based on the image data
      let fileExt = 'png'; // Default to png

      // More comprehensive MIME type detection
      const mimeTypeMatch = imageData.match(/^data:(image\/[^;]+);base64/);
      if (mimeTypeMatch && mimeTypeMatch[1]) {
        const mimeType = mimeTypeMatch[1].toLowerCase();
        console.log('Detected MIME type:', mimeType);

        // Map MIME types to file extensions - รองรับทุกประเภทไฟล์รูปภาพ
        if (mimeType === 'image/jpeg' || mimeType === 'image/jpg' || mimeType.includes('jpg') || mimeType.includes('jpeg')) {
          fileExt = 'jpg';
        } else if (mimeType === 'image/png' || mimeType.includes('png')) {
          fileExt = 'png';
        } else if (mimeType === 'image/gif' || mimeType.includes('gif')) {
          fileExt = 'gif';
        } else if (mimeType === 'image/webp' || mimeType.includes('webp')) {
          fileExt = 'webp';
        } else if (mimeType === 'image/svg+xml' || mimeType.includes('svg')) {
          fileExt = 'svg';
        } else if (mimeType === 'image/bmp' || mimeType.includes('bmp')) {
          fileExt = 'bmp';
        } else if (mimeType === 'image/tiff' || mimeType.includes('tiff')) {
          fileExt = 'tiff';
        } else if (mimeType === 'image/x-icon' || mimeType.includes('icon')) {
          fileExt = 'ico';
        } else {
          // Extract extension from MIME type
          try {
            fileExt = mimeType.split('/')[1];
          } catch (e) {
            console.log('Could not extract extension from MIME type, using default png');
            fileExt = 'png';
          }
        }
      } else {
        // Fallback to the old method if regex match fails - ตรวจสอบแบบไม่ใช้ regex
        console.log('Regex match failed, using fallback method');
        if (imageData.includes('image/jpeg') || imageData.includes('image/jpg') ||
            imageData.includes('jpg') || imageData.includes('jpeg')) {
          fileExt = 'jpg';
        } else if (imageData.includes('image/png') || imageData.includes('png')) {
          fileExt = 'png';
        } else if (imageData.includes('image/gif') || imageData.includes('gif')) {
          fileExt = 'gif';
        } else if (imageData.includes('image/webp') || imageData.includes('webp')) {
          fileExt = 'webp';
        } else if (imageData.includes('image/svg') || imageData.includes('svg')) {
          fileExt = 'svg';
        } else if (imageData.includes('image/bmp') || imageData.includes('bmp')) {
          fileExt = 'bmp';
        } else if (imageData.includes('image/tiff') || imageData.includes('tiff')) {
          fileExt = 'tiff';
        } else if (imageData.includes('image/x-icon') || imageData.includes('icon')) {
          fileExt = 'ico';
        }
      }

      console.log('Using file extension:', fileExt);

      const filename = `profile_${userId}_${timestamp}.${fileExt}`;

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`Created uploads directory at: ${uploadsDir}`);
      } else {
        console.log(`Using existing uploads directory at: ${uploadsDir}`);
      }

      // Ensure directory has proper permissions
      try {
        fs.accessSync(uploadsDir, fs.constants.R_OK | fs.constants.W_OK);
      } catch (err) {
        console.error('Uploads directory permission error:', err);
        try {
          fs.chmodSync(uploadsDir, 0o755);
        } catch (chmodErr) {
          console.error('Failed to fix uploads directory permissions:', chmodErr);
        }
      }

      // Save the image to the uploads directory
      const filePath = path.join(uploadsDir, filename);

      try {
        // Try to write the file with base64 encoding
        fs.writeFileSync(filePath, base64Data, 'base64');
        console.log('Successfully saved image to:', filePath);
      } catch (writeError) {
        console.error('Error writing image file:', writeError);

        // ใช้วิธี Buffer สำหรับทุกประเภทไฟล์ ไม่เฉพาะ JPG
        try {
          // ใช้ Buffer approach สำหรับทุกประเภทไฟล์
          const buffer = Buffer.from(base64Data, 'base64');
          fs.writeFileSync(filePath, buffer);
          console.log('Successfully saved image using buffer approach');
        } catch (altError) {
          console.error('Alternative save method also failed:', altError);

          // ถ้ายังไม่สำเร็จ ลองวิธีสุดท้าย
          try {
            // ลองใช้วิธีเขียนไฟล์แบบ binary
            const binaryData = Buffer.from(base64Data, 'base64').toString('binary');
            fs.writeFileSync(filePath, binaryData, 'binary');
            console.log('Successfully saved image using binary approach');
          } catch (finalError) {
            console.error('All save methods failed:', finalError);
            throw new Error('Failed to save image file after multiple attempts: ' + finalError.message);
          }
        }
      }

      // Set the URL for the database - use absolute path to ensure it works after restart
      profilePictureUrl = `/uploads/${filename}`;
      console.log('Setting profile picture URL in database:', profilePictureUrl);
    } else if (imageData) {
      // If image data is provided but not in base64 format
      return res.status(400).json({
        message: 'รูปแบบไฟล์ไม่ถูกต้อง กรุณาอัปโหลดไฟล์รูปภาพที่มีนามสกุล .jpg, .png, .gif, .webp, .svg หรืออื่นๆ'
      });
    } else {
      // If no image data is provided, use a random profile picture from randomuser.me
      profilePictureUrl = `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`;
    }

    // Update user profile in database
    await db.query(
      'UPDATE users SET profile_picture = ?, updated_at = NOW() WHERE user_id = ?',
      [profilePictureUrl, userId]
    );

    console.log('Profile picture updated in database:', profilePictureUrl);

    res.status(200).json({
      message: 'Profile picture updated successfully',
      profilePictureUrl
    });

  } catch (error) {
    console.error('Upload profile picture error:', error);

    // ตรวจสอบประเภทข้อผิดพลาดเพื่อให้ข้อความที่เฉพาะเจาะจงมากขึ้น
    let statusCode = 500;
    let errorMessage = 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองใหม่อีกครั้งหรือใช้รูปภาพอื่น';

    if (error.message && error.message.includes('Invalid image format')) {
      statusCode = 415; // Unsupported Media Type
      errorMessage = 'รูปแบบไฟล์ไม่รองรับ กรุณาใช้ไฟล์รูปภาพที่มีนามสกุล .jpg, .png, .gif, .webp, .svg หรืออื่นๆ';
    } else if (error.message && error.message.includes('too large')) {
      statusCode = 413; // Payload Too Large
      errorMessage = 'ไฟล์มีขนาดใหญ่เกินไป กรุณาลดขนาดไฟล์และลองใหม่อีกครั้ง';
    } else if (error.code === 'ENOSPC') {
      errorMessage = 'พื้นที่เซิร์ฟเวอร์ไม่เพียงพอ กรุณาติดต่อผู้ดูแลระบบ';
    } else if (error.code === 'EACCES') {
      errorMessage = 'ไม่มีสิทธิ์ในการเขียนไฟล์ กรุณาติดต่อผู้ดูแลระบบ';
    }

    // Provide more detailed error message
    res.status(statusCode).json({
      message: errorMessage,
      error: error.message
    });
  }
};