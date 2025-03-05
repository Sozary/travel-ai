const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;

export const keepAlive = () => {
    setInterval(async () => {
        try {
            await fetch(`https://${API_DOMAIN}/healthcheck`, { method: "GET" });
            console.log("Pinged server to keep it alive");
        } catch (error) {
            console.error("Error pinging server:", error);
        }
    }, 60 * 1000); // Ping every minute
};
