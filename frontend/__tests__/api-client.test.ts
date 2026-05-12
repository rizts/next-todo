import { apiRequest } from "../lib/api-client";
import { authClient } from "../lib/auth-client";

// Mock authClient
jest.mock("../lib/auth-client", () => ({
    authClient: {
        jwt: {
            getToken: jest.fn()
        },
        getSession: jest.fn()
    }
}));

// Mock global fetch
global.fetch = jest.fn();

describe("apiRequest", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch JWT from /api/auth/token endpoint and include it in Authorization header", async () => {
        const mockToken = "mock-jwt-token";
        
        // Mock fetch for token
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ token: mockToken })
            })
            // Mock fetch for actual API call
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });

        const result = await apiRequest("/test-endpoint");

        expect(global.fetch).toHaveBeenCalledWith("/api/auth/token");
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/test-endpoint"),
            expect.objectContaining({
                headers: expect.objectContaining({
                    "Authorization": `Bearer ${mockToken}`
                })
            })
        );
        expect(result).toEqual({ success: true });
    });

    it("should fallback to session token if /token endpoint fails or returns no token", async () => {
        const mockSessionToken = "session-jwt-token";
        (authClient.jwt.getToken as jest.Mock).mockResolvedValue({ data: null });
        (authClient.getSession as jest.Mock).mockResolvedValue({
            data: { session: { jwt: mockSessionToken } }
        });

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true })
        });

        await apiRequest("/test-endpoint");

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/test-endpoint"),
            expect.objectContaining({
                headers: expect.objectContaining({
                    "Authorization": `Bearer ${mockSessionToken}`
                })
            })
        );
    });

    it("should throw error if API response is not ok", async () => {
        (authClient.jwt.getToken as jest.Mock).mockResolvedValue({ data: { token: "token" } });
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({ detail: "API Error" })
        });

        await expect(apiRequest("/test-endpoint")).rejects.toThrow("API Error");
    });
});
