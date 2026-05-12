import { sendWelcomeEmail } from "../lib/email";

// Mock global fetch
global.fetch = jest.fn();

describe("sendWelcomeEmail", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, BREVO_API_KEY: "test-api-key", BREVO_SENDER_EMAIL: "test@sender.com" };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("should send email with correct payload to Brevo API", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ messageId: "12345" })
        });

        const toEmail = "user@example.com";
        const name = "John Doe";
        
        await sendWelcomeEmail(toEmail, name);

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api.brevo.com/v3/smtp/email",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    "api-key": "test-api-key",
                    "content-type": "application/json"
                }),
                body: expect.stringContaining(toEmail)
            })
        );

        const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
        expect(body.to[0].email).toBe(toEmail);
        expect(body.subject).toBe("Welcome to Todo App! 🚀");
        expect(body.htmlContent).toContain(name);
    });

    it("should not send email if BREVO_API_KEY is missing", async () => {
        delete process.env.BREVO_API_KEY;
        const warnSpy = jest.spyOn(console, "warn").mockImplementation();

        await sendWelcomeEmail("user@example.com", "User");

        expect(global.fetch).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("BREVO_API_KEY is not set"));
        
        warnSpy.mockRestore();
    });

    it("should handle API errors gracefully", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({ message: "Invalid API Key" })
        });
        const errorSpy = jest.spyOn(console, "error").mockImplementation();

        await sendWelcomeEmail("user@example.com", "User");

        expect(errorSpy).toHaveBeenCalledWith("Error sending welcome email:", expect.any(Error));
        
        errorSpy.mockRestore();
    });
});
