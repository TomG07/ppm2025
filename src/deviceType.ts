export const getDeviceType = (): string => {
    const ua = navigator.userAgent;

    if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
    if (/Mobile|iPhone|Android/i.test(ua)) return "Mobile";
    return "Desktop";
};
