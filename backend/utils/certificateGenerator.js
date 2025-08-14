const crypto = require('crypto');

/**
 * Generate a unique certificate ID
 * @returns {string} Certificate ID
 */
const generateCertificateId = () => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `CERT-${timestamp}-${randomString}`;
};

/**
 * Generate a verification code for certificate
 * @returns {string} Verification code
 */
const generateVerificationCode = () => {
    return crypto.randomBytes(6).toString('hex').toUpperCase();
};

/**
 * Create certificate data structure
 * @param {Object} params - Certificate parameters
 * @returns {Object} Certificate data
 */
const createCertificateData = ({
    studentName,
    studentEmail,
    courseTitle,
    instructorName,
    completionDate,
    grade,
    certificateId,
    verificationCode
}) => {
    return {
        certificateId: certificateId || generateCertificateId(),
        verificationCode: verificationCode || generateVerificationCode(),
        issueDate: new Date(),
        student: {
            name: studentName,
            email: studentEmail
        },
        course: {
            title: courseTitle,
            instructor: instructorName,
            completionDate: completionDate || new Date(),
            finalGrade: grade
        },
        template: 'default',
        status: 'active'
    };
};

/**
 * Generate certificate HTML content
 * @param {Object} certificateData - Certificate data
 * @returns {string} HTML content
 */
const generateCertificateHTML = (certificateData) => {
    const {
        certificateId,
        verificationCode,
        issueDate,
        student,
        course
    } = certificateData;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of Completion</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Georgia', serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            
            .certificate {
                background: white;
                width: 800px;
                padding: 60px;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                border: 8px solid #f8f9fa;
                position: relative;
                overflow: hidden;
            }
            
            .certificate::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 8px;
                background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe);
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .logo {
                font-size: 2.5em;
                color: #667eea;
                margin-bottom: 10px;
            }
            
            .title {
                font-size: 2.2em;
                color: #2c3e50;
                margin-bottom: 10px;
                font-weight: bold;
                letter-spacing: 2px;
            }
            
            .subtitle {
                font-size: 1.1em;
                color: #7f8c8d;
                font-style: italic;
            }
            
            .content {
                text-align: center;
                margin: 40px 0;
            }
            
            .awarded-to {
                font-size: 1.2em;
                color: #5a6c7d;
                margin-bottom: 20px;
            }
            
            .student-name {
                font-size: 2.8em;
                color: #2c3e50;
                font-weight: bold;
                margin: 20px 0;
                text-decoration: underline;
                text-decoration-color: #667eea;
                text-underline-offset: 10px;
            }
            
            .course-info {
                font-size: 1.3em;
                color: #5a6c7d;
                margin: 30px 0;
                line-height: 1.6;
            }
            
            .course-title {
                color: #667eea;
                font-weight: bold;
                font-size: 1.1em;
            }
            
            .instructor {
                color: #764ba2;
                font-weight: 500;
            }
            
            .completion-info {
                display: flex;
                justify-content: space-between;
                margin-top: 50px;
                padding-top: 30px;
                border-top: 2px solid #ecf0f1;
            }
            
            .date-section, .grade-section {
                text-align: center;
                flex: 1;
            }
            
            .section-label {
                font-size: 0.9em;
                color: #7f8c8d;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 8px;
            }
            
            .section-value {
                font-size: 1.2em;
                color: #2c3e50;
                font-weight: bold;
            }
            
            .verification {
                text-align: center;
                margin-top: 40px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
                border-left: 4px solid #667eea;
            }
            
            .verification-title {
                font-size: 0.9em;
                color: #7f8c8d;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
            }
            
            .certificate-id, .verification-code {
                font-family: 'Courier New', monospace;
                font-size: 1em;
                color: #2c3e50;
                font-weight: bold;
                margin: 5px 0;
            }
            
            .decorative-elements {
                position: absolute;
                top: 30px;
                right: 30px;
                font-size: 3em;
                color: #f8f9fa;
                opacity: 0.3;
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                
                .certificate {
                    box-shadow: none;
                    border: 2px solid #667eea;
                }
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="decorative-elements">🎓</div>
            
            <div class="header">
                <div class="logo">📚</div>
                <h1 class="title">CERTIFICATE OF COMPLETION</h1>
                <p class="subtitle">This certifies that</p>
            </div>
            
            <div class="content">
                <h2 class="student-name">${student.name}</h2>
                
                <div class="course-info">
                    has successfully completed the course<br>
                    <span class="course-title">${course.title}</span><br>
                    under the instruction of <span class="instructor">${course.instructor}</span>
                </div>
            </div>
            
            <div class="completion-info">
                <div class="date-section">
                    <div class="section-label">Completion Date</div>
                    <div class="section-value">${new Date(course.completionDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</div>
                </div>
                ${course.finalGrade ? `
                <div class="grade-section">
                    <div class="section-label">Final Grade</div>
                    <div class="section-value">${course.finalGrade}%</div>
                </div>
                ` : ''}
            </div>
            
            <div class="verification">
                <div class="verification-title">Certificate Verification</div>
                <div class="certificate-id">ID: ${certificateId}</div>
                <div class="verification-code">Code: ${verificationCode}</div>
                <p style="font-size: 0.8em; color: #7f8c8d; margin-top: 10px;">
                    Verify this certificate at: yourplatform.com/verify
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Generate a shareable certificate URL
 * @param {string} certificateId - Certificate ID
 * @param {string} baseUrl - Base URL of the application
 * @returns {string} Shareable URL
 */
const generateShareableUrl = (certificateId, baseUrl = 'https://yourplatform.com') => {
    return `${baseUrl}/certificates/${certificateId}`;
};

/**
 * Validate certificate data
 * @param {Object} certificateData - Certificate data to validate
 * @returns {Object} Validation result
 */
const validateCertificate = (certificateData) => {
    const errors = [];
    
    if (!certificateData.student?.name) {
        errors.push('Student name is required');
    }
    
    if (!certificateData.student?.email) {
        errors.push('Student email is required');
    }
    
    if (!certificateData.course?.title) {
        errors.push('Course title is required');
    }
    
    if (!certificateData.course?.instructor) {
        errors.push('Instructor name is required');
    }
    
    if (!certificateData.certificateId) {
        errors.push('Certificate ID is required');
    }
    
    if (!certificateData.verificationCode) {
        errors.push('Verification code is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Generate certificate metadata for database storage
 * @param {Object} certificateData - Certificate data
 * @returns {Object} Metadata object
 */
const generateCertificateMetadata = (certificateData) => {
    return {
        certificateId: certificateData.certificateId,
        verificationCode: certificateData.verificationCode,
        issueDate: certificateData.issueDate,
        studentId: certificateData.studentId,
        courseId: certificateData.courseId,
        template: certificateData.template || 'default',
        status: 'active',
        downloadCount: 0,
        shareCount: 0,
        createdAt: new Date(),
        expiryDate: null // Certificates don't expire by default
    };
};

/**
 * Create a simple text-based certificate for email
 * @param {Object} certificateData - Certificate data
 * @returns {string} Text certificate
 */
const generateTextCertificate = (certificateData) => {
    const {
        certificateId,
        verificationCode,
        student,
        course
    } = certificateData;

    return `
===============================================
         CERTIFICATE OF COMPLETION
===============================================

This certifies that

${student.name.toUpperCase()}

has successfully completed the course

"${course.title}"

under the instruction of ${course.instructor}

Completion Date: ${new Date(course.completionDate).toLocaleDateString()}
${course.finalGrade ? `Final Grade: ${course.finalGrade}%` : ''}

Certificate ID: ${certificateId}
Verification Code: ${verificationCode}

Verify at: yourplatform.com/verify

===============================================
    `;
};

module.exports = {
    generateCertificateId,
    generateVerificationCode,
    createCertificateData,
    generateCertificateHTML,
    generateShareableUrl,
    validateCertificate,
    generateCertificateMetadata,
    generateTextCertificate
};