#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

// Caflou API configuration
interface CaflouConfig {
  accountId: string;
  apiKey: string;
  baseUrl: string;
}

// Load configuration from environment or secrets
async function loadConfig(): Promise<CaflouConfig> {
  const secretsDir = join(homedir(), ".secrets");

  const accountId = await readFile(join(secretsDir, "caflou-account-id"), "utf-8").then(s => s.trim());
  const apiKey = await readFile(join(secretsDir, "caflou-api-key"), "utf-8").then(s => s.trim());

  return {
    accountId,
    apiKey,
    baseUrl: "https://app.caflou.com/api/v1",
  };
}

// Make authenticated request to Caflou API
async function caflourRequest(
  config: CaflouConfig,
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${config.baseUrl}/${config.accountId}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Caflou API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Define available tools
const TOOLS: Tool[] = [
  {
    name: "caflou_list_tasks",
    description: "List tasks from Caflou CRM. Supports filtering by search term, finished status, and pagination.",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Search term to filter tasks (searches in task name/description)",
        },
        finished: {
          type: "boolean",
          description: "Filter by finished status (true = finished, false = not finished)",
        },
        per: {
          type: "number",
          description: "Number of results per page (default: 50)",
          default: 50,
        },
        page: {
          type: "number",
          description: "Page number (default: 1)",
          default: 1,
        },
      },
    },
  },
  {
    name: "caflou_get_task",
    description: "Get details of a specific task by ID",
    inputSchema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: "Task ID",
        },
      },
      required: ["taskId"],
    },
  },
  {
    name: "caflou_list_contacts",
    description: "List contacts from Caflou CRM. Can filter by company and search term.",
    inputSchema: {
      type: "object",
      properties: {
        companyId: {
          type: "string",
          description: "Filter by company ID",
        },
        search: {
          type: "string",
          description: "Search term to filter contacts",
        },
        per: {
          type: "number",
          description: "Number of results per page (default: 50)",
          default: 50,
        },
        page: {
          type: "number",
          description: "Page number (default: 1)",
          default: 1,
        },
      },
    },
  },
  {
    name: "caflou_get_contact",
    description: "Get details of a specific contact by ID",
    inputSchema: {
      type: "object",
      properties: {
        contactId: {
          type: "string",
          description: "Contact ID",
        },
      },
      required: ["contactId"],
    },
  },
  {
    name: "caflou_list_companies",
    description: "List companies from Caflou CRM. Supports search and pagination.",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Search term to filter companies",
        },
        per: {
          type: "number",
          description: "Number of results per page (default: 50)",
          default: 50,
        },
        page: {
          type: "number",
          description: "Page number (default: 1)",
          default: 1,
        },
      },
    },
  },
  {
    name: "caflou_get_company",
    description: "Get details of a specific company by ID",
    inputSchema: {
      type: "object",
      properties: {
        companyId: {
          type: "string",
          description: "Company ID",
        },
      },
      required: ["companyId"],
    },
  },
  {
    name: "caflou_list_deals",
    description: "List deals from Caflou CRM. Supports filtering and pagination.",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Search term to filter deals",
        },
        per: {
          type: "number",
          description: "Number of results per page (default: 50)",
          default: 50,
        },
        page: {
          type: "number",
          description: "Page number (default: 1)",
          default: 1,
        },
      },
    },
  },
  {
    name: "caflou_get_deal",
    description: "Get details of a specific deal by ID",
    inputSchema: {
      type: "object",
      properties: {
        dealId: {
          type: "string",
          description: "Deal ID",
        },
      },
      required: ["dealId"],
    },
  },
  {
    name: "caflou_list_invoices",
    description: "List invoices from Caflou CRM. Supports filtering by kind, payment status, and pagination.",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Search term to filter invoices",
        },
        kind: {
          type: "string",
          description: "Invoice kind (invoice, proforma, offer, tax_receipt, etc.)",
        },
        paid: {
          type: "boolean",
          description: "Filter by paid status",
        },
        per: {
          type: "number",
          description: "Number of results per page (default: 50)",
          default: 50,
        },
        page: {
          type: "number",
          description: "Page number (default: 1)",
          default: 1,
        },
      },
    },
  },
  {
    name: "caflou_get_invoice",
    description: "Get details of a specific invoice by ID",
    inputSchema: {
      type: "object",
      properties: {
        invoiceId: {
          type: "string",
          description: "Invoice ID",
        },
      },
      required: ["invoiceId"],
    },
  },
  {
    name: "caflou_list_projects",
    description: "List projects from Caflou CRM. Supports filtering and pagination.",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Search term to filter projects",
        },
        finished: {
          type: "boolean",
          description: "Filter by finished status",
        },
        per: {
          type: "number",
          description: "Number of results per page (default: 50)",
          default: 50,
        },
        page: {
          type: "number",
          description: "Page number (default: 1)",
          default: 1,
        },
      },
    },
  },
  {
    name: "caflou_get_project",
    description: "Get details of a specific project by ID",
    inputSchema: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "Project ID",
        },
      },
      required: ["projectId"],
    },
  },
  {
    name: "caflou_list_time_entries",
    description: "List time entries from Caflou CRM. Time tracking records for projects and tasks.",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Search term to filter time entries",
        },
        projectId: {
          type: "string",
          description: "Filter by project ID",
        },
        userId: {
          type: "string",
          description: "Filter by user ID",
        },
        per: {
          type: "number",
          description: "Number of results per page (default: 50)",
          default: 50,
        },
        page: {
          type: "number",
          description: "Page number (default: 1)",
          default: 1,
        },
      },
    },
  },
  {
    name: "caflou_get_time_entry",
    description: "Get details of a specific time entry by ID",
    inputSchema: {
      type: "object",
      properties: {
        timeEntryId: {
          type: "string",
          description: "Time entry ID",
        },
      },
      required: ["timeEntryId"],
    },
  },
];

// Main server implementation
const server = new Server(
  {
    name: "mcp-server-caflou",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const config = await loadConfig();
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case "caflou_list_tasks": {
        const params = new URLSearchParams();
        if (args.search) params.append("filter[search]", args.search as string);
        if (args.finished !== undefined) params.append("filter[finished]", String(args.finished));
        params.append("per", String(args.per || 50));
        params.append("page", String(args.page || 1));

        const data = await caflourRequest(config, `/tasks?${params}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "caflou_get_task": {
        const data = await caflourRequest(config, `/tasks/${args.taskId}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "caflou_list_contacts": {
        const params = new URLSearchParams();
        if (args.search) params.append("filter[search]", args.search as string);
        params.append("per", String(args.per || 50));
        params.append("page", String(args.page || 1));

        let endpoint = "/contacts";
        if (args.companyId) {
          endpoint = `/companies/${args.companyId}/contacts`;
        }

        const data = await caflourRequest(config, `${endpoint}?${params}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "caflou_get_contact": {
        const data = await caflourRequest(config, `/contacts/${args.contactId}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "caflou_list_companies": {
        const params = new URLSearchParams();
        if (args.search) params.append("filter[search]", args.search as string);
        params.append("per", String(args.per || 50));
        params.append("page", String(args.page || 1));

        const data = await caflourRequest(config, `/companies?${params}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "caflou_get_company": {
        const data = await caflourRequest(config, `/companies/${args.companyId}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "caflou_list_deals": {
        const params = new URLSearchParams();
        if (args.search) params.append("filter[search]", args.search as string);
        params.append("per", String(args.per || 50));
        params.append("page", String(args.page || 1));

        const data = await caflourRequest(config, `/deals?${params}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "caflou_get_deal": {
        const data = await caflourRequest(config, `/deals/${args.dealId}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "caflou_list_invoices": {
        const params = new URLSearchParams();
        if (args.search) params.append("filter[search]", args.search as string);
        if (args.kind) params.append("filter[kind]", args.kind as string);
        if (args.paid !== undefined) params.append("filter[paid]", String(args.paid));
        params.append("per", String(args.per || 50));
        params.append("page", String(args.page || 1));

        const data = await caflourRequest(config, `/invoices?${params}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "caflou_get_invoice": {
        const data = await caflourRequest(config, `/invoices/${args.invoiceId}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "caflou_list_projects": {
        const params = new URLSearchParams();
        if (args.search) params.append("filter[search]", args.search as string);
        if (args.finished !== undefined) params.append("filter[finished]", String(args.finished));
        params.append("per", String(args.per || 50));
        params.append("page", String(args.page || 1));

        const data = await caflourRequest(config, `/projects?${params}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "caflou_get_project": {
        const data = await caflourRequest(config, `/projects/${args.projectId}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "caflou_list_time_entries": {
        const params = new URLSearchParams();
        if (args.search) params.append("filter[search]", args.search as string);
        if (args.projectId) params.append("filter[project_id]", args.projectId as string);
        if (args.userId) params.append("filter[user_id]", args.userId as string);
        params.append("per", String(args.per || 50));
        params.append("page", String(args.page || 1));

        const data = await caflourRequest(config, `/time_entries?${params}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "caflou_get_time_entry": {
        const data = await caflourRequest(config, `/time_entries/${args.timeEntryId}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Caflou MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
