export const DAP_SCHEMA = {
  name: "dap_declic_pro_result",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      profile_type: { type: "string" },
      compatibility: {
        type: "object",
        additionalProperties: false,
        properties: {
          score_percent: { type: "number" },
          rationale: { type: "string" }
        },
        required: ["score_percent", "rationale"]
      },
      strengths: { type: "array", items: { type: "string" } },
      limits: { type: "array", items: { type: "string" } },

      recommended_roles: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            score_percent: { type: "number" },
            description: { type: "string" },
            image_url: { type: "string", format: "uri" }
          },
          required: ["title", "score_percent", "description"]
        }
      },

      recommended_companies: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            score_percent: { type: "number" },
            explanation: { type: "string" },
            logo_url: { type: "string", format: "uri" }
          },
          required: ["name", "score_percent", "explanation"]
        }
      },

      action_plan: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: { type: "string" },
          steps: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 10 }
        },
        required: ["summary", "steps"]
      },

      dap_training_cta: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          url: { type: "string", format: "uri" }
        },
        required: ["label", "url"]
      }
    },
    required: [
      "profile_type",
      "compatibility",
      "strengths",
      "limits",
      "recommended_roles",
      "recommended_companies",
      "action_plan",
      "dap_training_cta"
    ]
  }
} as const;
