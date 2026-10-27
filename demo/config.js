// The one place to edit before launch.
export default {
  // The switch. false: the page shows "Demo Opens Soon" and the button stays disabled.
  enabled: false,

  // Dev only. true lets ?demo-state=... draw sample states (see preview.js). Keep false in production.
  preview: false,

  // Launch mode: our Worker (see /worker). POST { business, turnstileToken } -> { conversationToken }.
  // Leave empty for test mode.
  tokenEndpoint: "",
  turnstileSiteKey: "",

  // Test mode (tokenEndpoint empty): public agents with the hostname allowlist on.
  // Agent IDs are not secret. In launch mode the Worker holds the real mapping.
  agentIds: {
    dental: "",
    hvac: "",
    roofing: "",
    medspa: "",
    law: "",
  },

  // Must match max_duration_seconds on each agent.
  maxSeconds: 180,
  warnSeconds: 150,
  connectTimeoutMs: 10000,
};
