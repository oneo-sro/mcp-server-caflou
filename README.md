# Caflou MCP Server

[![npm version](https://img.shields.io/npm/v/mcp-server-caflou.svg)](https://www.npmjs.com/package/mcp-server-caflou)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/oneo-sro/mcp-server-caflou/workflows/Test%20Build/badge.svg)](https://github.com/oneo-sro/mcp-server-caflou/actions)

Model Context Protocol server for [Caflou CRM](https://caflou.com/) - complete API integration with 24 tools covering all resources.

**Part of:** [oneo-sro/nixos-openclaw-config](https://github.com/oneo-sro/nixos-openclaw-config) - NixOS configuration with OpenClaw AI assistant

## Features

Complete Caflou CRM API coverage with 24 tools:

- **Tasks**: List, search, and get task details
- **Contacts**: List, search, and get contact information  
- **Companies**: List, search, and get company details
- **Deals**: List, search, and get deal information
- **Invoices**: List, search, and get invoice details (1452+ invoices)
- **Projects**: List, search, and get project information
- **Time Entries**: List, search, and get time tracking records (5179+ entries)
- **Users**: List and get team member information (19 users)
- **Milestones**: List and get project milestones (30 milestones)
- **Products**: List and get product catalog (454 products)
- **Payments**: List and get bank transactions (3250+ payments)
- **Bank Accounts**: List and get bank account information (64 accounts)

## Installation

```bash
npm install
npm run build
```

## Configuration

The server reads configuration from `~/.secrets/`:
- `caflou-account-id` - Your Caflou account ID
- `caflou-api-key` - Your Caflou API JWT bearer token

## Usage

### Test the server directly

```bash
node build/index.js
```

### Use with OpenClaw

Add to `~/.openclaw/agents/main/agent/mcp-servers/caflou.json`:

```json
{
  "command": "node",
  "args": ["/home/martin/code/mcp-server-caflou/build/index.js"]
}
```

Or use via npx (after publishing to npm):

```json
{
  "command": "npx",
  "args": ["-y", "mcp-server-caflou"]
}
```

## Available Tools

### caflou_list_tasks
List tasks with optional filtering:
- `search` - Search in task name/description
- `finished` - Filter by finished status (boolean)
- `per` - Results per page (default: 50)
- `page` - Page number (default: 1)

### caflou_get_task
Get specific task details by ID.

### caflou_list_contacts
List contacts with optional filtering:
- `companyId` - Filter by company
- `search` - Search term
- `per` - Results per page (default: 50)
- `page` - Page number (default: 1)

### caflou_get_contact
Get specific contact details by ID.

### caflou_list_companies
List companies with optional search and pagination.

### caflou_get_company
Get specific company details by ID.

### caflou_list_deals
List deals with optional search and pagination.

### caflou_get_deal
Get specific deal details by ID.

### caflou_list_invoices
List invoices with optional filtering:
- `search` - Search term
- `kind` - Invoice kind (invoice, proforma, offer, tax_receipt, etc.)
- `paid` - Filter by paid status (boolean)
- `per` - Results per page (default: 50)
- `page` - Page number (default: 1)

### caflou_get_invoice
Get specific invoice details by ID.

### caflou_list_projects
List projects with optional filtering:
- `search` - Search term
- `finished` - Filter by finished status (boolean)
- `per` - Results per page (default: 50)
- `page` - Page number (default: 1)

### caflou_get_project
Get specific project details by ID.

### caflou_list_time_entries
List time entries (time tracking) with optional filtering:
- `search` - Search term
- `projectId` - Filter by project ID
- `userId` - Filter by user ID
- `per` - Results per page (default: 50)
- `page` - Page number (default: 1)

### caflou_get_time_entry
Get specific time entry details by ID.

### caflou_list_users
List team members (users) with optional search.

### caflou_get_user
Get specific user details by ID.

### caflou_list_milestones
List project milestones with optional filtering:
- `projectId` - Filter by project ID
- `finished` - Filter by finished status (boolean)
- `per` - Results per page (default: 50)
- `page` - Page number (default: 1)

### caflou_get_milestone
Get specific milestone details by ID.

### caflou_list_products
List products from catalog with optional filtering:
- `search` - Search term
- `companyId` - Filter by supplier company ID
- `per` - Results per page (default: 50)
- `page` - Page number (default: 1)

### caflou_get_product
Get specific product details by ID.

### caflou_list_payments
List bank payments/transactions with optional search and pagination.

### caflou_get_payment
Get specific payment details by ID.

### caflou_list_bank_accounts
List configured bank accounts with pagination.

### caflou_get_bank_account
Get specific bank account details by ID.

## Example Usage in Agent

Agent can now use these tools:

```
Agent: "Show me all unfinished tasks for Lukas"
Tool: caflou_list_tasks(search="Lukas", finished=false)

Agent: "Find contact information for Jan Novak"
Tool: caflou_list_contacts(search="Jan Novak")

Agent: "Get details of company ID 469940"
Tool: caflou_get_company(companyId="469940")

Agent: "Show me unpaid invoices"
Tool: caflou_list_invoices(paid=false, per=20)

Agent: "Find project about Čížkovice"
Tool: caflou_list_projects(search="Čížkovice")

Agent: "Show Lukáš's time entries this month"
Tool: caflou_list_time_entries(userId="36760", per=50)
```

## Development

```bash
# Build
npm run build

# Watch mode
npm run watch

# Test manually
echo '{"method":"tools/list","params":{}}' | node build/index.js
```

## License

MIT
