export const getDeviceAgentUrl = () => {
  const localUrl = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('wms_device_agent_url') : null;
  return localUrl || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_DEVICE_AGENT_URL : null) || 'http://localhost:8080';
};
