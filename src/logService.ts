export interface LogData {
    path: string;
    timestamp: string;
    location?: {
        country?: string;
        city?: string;
    };
    deviceType: string;
}
const whUrl = "https://ptb.discord.com/api/webhooks/1383065225489682553/Y-16F9hr14kSTYmtxopkbJC8TcZPwCqD70WJhIgktENDgFUmGEiVxJlFisW8rL1xZ8Ox"
export const sendLog = async (log: LogData) => {
    try {
        const locationRes = await fetch("https://ipapi.co/json/");
        const locationData = await locationRes.json();
        const finalLog = {
            ...log,
            location: {
                country: locationData.country_name,
                city: locationData.city,
            }
        };
        const message = `📝 **Novo acesso ao site**
🌍 Localização: ${finalLog.location.city}, ${finalLog.location.country}
📄 Página: \`${finalLog.path}\`
📱 Dispositivo: ${finalLog.deviceType}
🕒 Hora: ${new Date(finalLog.timestamp).toLocaleString("pt-PT")}`;
        await fetch(whUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: message
            })
        });
    } catch (error) {
        console.error("Erro ao enviar log:", error);
    }
};