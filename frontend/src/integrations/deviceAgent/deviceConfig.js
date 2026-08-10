export const getDeviceAgentUrl = () => {
  const localUrl = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('wms_device_agent_url') : null;
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_DEVICE_AGENT_URL : null;
  return localUrl || envUrl || 'http://localhost:8080';
};

export const getDeviceAgentToken = () => {
  const localToken = typeof window !== 'undefined' && window.localStorage
    ? localStorage.getItem('wms_device_agent_token') || localStorage.getItem('X-Device-Agent-Token')
    : null;
  const envToken = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_DEVICE_AGENT_TOKEN : null;
  return localToken || envToken || '';
};
