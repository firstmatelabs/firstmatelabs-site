// The one place to edit before launch.
export default {
  // The switch. false: the page shows "Demo Opens Soon" and the button stays disabled.
  enabled: true,

  // Dev only. true lets ?demo-state=... draw sample states (see preview.js). Keep false in production.
  preview: false,

  // Launch mode: our Worker (see /worker). POST { business, turnstileToken } -> { conversationToken }.
  // Leave empty for test mode.
  tokenEndpoint: "",
  turnstileSiteKey: "",

  // Test mode (tokenEndpoint empty): public agents with the hostname allowlist on.
  // Agent IDs are not secret. In launch mode the Worker holds the real mapping.
  agentIds: {
    dental: "agent_0601m60gppkkea6v2h2mar6nyssw",
    hvac: "agent_1101m60gqkyye9kt5h6qdwf9knpw",
    roofing: "agent_6901m60gqn2perga64q618869665",
    medspa: "agent_7101m60gqpbnfcxt0h03n51hb73d",
    law: "agent_4001m60gqqkdeq0r8krhteq6wn33",
  },

  // Must match max_duration_seconds on each agent.
  maxSeconds: 180,
  warnSeconds: 150,
  connectTimeoutMs: 10000,
};
