export async function sendWelcomeEmail(toEmail: string, name: string) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "hello@yourtodoapp.com";

    if (!apiKey) {
        console.warn("BREVO_API_KEY is not set. Skipping welcome email.");
        return;
    }

    const payload = {
        sender: {
            name: "Todo App",
            email: senderEmail,
        },
        to: [
            {
                email: toEmail,
                name: name,
            },
        ],
        subject: "Welcome to Todo App! 🚀",
        htmlContent: `
            <html>
                <body>
                    <h1>Hello, ${name}!</h1>
                    <p>Welcome to Todo App. We're excited to help you stay productive.</p>
                    <p>Start by adding your first todo in the dashboard!</p>
                    <br />
                    <p>Cheers,</p>
                    <p>The Todo App Team</p>
                </body>
            </html>
        `,
    };

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": apiKey,
                "content-type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to send email");
        }

        const data = await response.json();
        console.log("Welcome email sent successfully via Fetch:", data);
        return data;
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
}
