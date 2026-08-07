export const getDeviceAgentUrl = () => {
  const localUrl = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('wms_device_agent_url') : null;
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_DEVICE_AGENT_URL : null;
  return localUrl || envUrl || (isLocalhost ? 'http://localhost:8080' : `http://${window.location.hostname}:8080`);
};

export const getDeviceAgentToken = () => {
  return typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('X-Device-Agent-Token') : null;
};
