import { Resend } from 'resend';

// Initialize Resend with API key
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY is not set. Please add it to your .env.local file.');
}

const resend = new Resend(resendApiKey || 'dummy-key');

interface SendInviteEmailParams {
    to: string[];
    courseName: string;
    courseUrl: string;
    inviterName?: string;
}

export async function sendCourseInviteEmails({
    to,
    courseName,
    courseUrl,
    inviterName = 'Japanese Learning Platform'
}: SendInviteEmailParams) {
    // Check if API key is available
    if (!resendApiKey || resendApiKey === 'dummy-key' || resendApiKey === 're_your_resend_api_key_here') {
        console.log('🧪 TEST MODE: Email service not configured with real API key');
        console.log('📧 Would send emails to:', to);
        console.log('📝 Course:', courseName);
        console.log('🔗 URL:', courseUrl);
        
        // Simulate successful email sending for testing
        return { 
            success: true, 
            data: { 
                id: 'test-' + Date.now(), 
                message: 'Test mode - emails would be sent in production' 
            } 
        };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Japanese Learning Platform <noreply@yourdomain.com>', // Replace with your verified domain
            to: to,
            subject: `You're invited to join ${courseName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 40px;
                            border-radius: 10px;
                            color: white;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 8px;
                            margin-top: 20px;
                            color: #333;
                        }
                        .button {
                            display: inline-block;
                            padding: 14px 32px;
                            background: #4285f4;
                            color: white;
                            text-decoration: none;
                            border-radius: 6px;
                            font-weight: 600;
                            margin: 20px 0;
                        }
                        .button:hover {
                            background: #3367d6;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            color: #666;
                            font-size: 14px;
                        }
                        h1 {
                            margin: 0 0 20px 0;
                            font-size: 28px;
                        }
                        .course-name {
                            color: #4285f4;
                            font-weight: 600;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🎌 You're Invited!</h1>
                        <p style="font-size: 18px; margin: 0;">Join us on an exciting Japanese learning journey</p>
                    </div>
                    
                    <div class="content">
                        <h2>Hello! 👋</h2>
                        
                        <p>You've been invited to join <span class="course-name">"${courseName}"</span> on Japanese Learning Platform.</p>
                        
                        <p>This course will help you:</p>
                        <ul>
                            <li>Master Japanese language skills</li>
                            <li>Learn at your own pace</li>
                            <li>Track your progress</li>
                            <li>Join a community of learners</li>
                        </ul>
                        
                        <p>Click the button below to enroll and start learning:</p>
                        
                        <center>
                            <a href="${courseUrl}" class="button">
                                📚 Enroll Now
                            </a>
                        </center>
                        
                        <p style="margin-top: 30px;">
                            Or copy and paste this link in your browser:<br>
                            <a href="${courseUrl}" style="color: #4285f4; word-break: break-all;">${courseUrl}</a>
                        </p>
                        
                        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
                            This invitation was sent by ${inviterName}. If you didn't expect this email, you can safely ignore it.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2025 Japanese Learning Platform. All rights reserved.</p>
                        <p>Happy Learning! 🎓</p>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            throw error;
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error sending invite emails:', error);
        throw error;
    }
}
