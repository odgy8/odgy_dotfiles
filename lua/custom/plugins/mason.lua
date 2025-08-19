return {
	{
		"williamboman/mason.nvim",
		dependencies = {
			"williamboman/mason-lspconfig.nvim",
			"neovim/nvim-lspconfig",
			"WhoIsSethDaniel/mason-tool-installer.nvim",

			"hrsh7th/nvim-cmp", -- Completion plugin
			"hrsh7th/cmp-nvim-lsp", -- LSP completion
			"L3MON4D3/LuaSnip", -- Snippet engine
			"saadparwaiz1/cmp_luasnip", -- Snippet completion
			"rafamadriz/friendly-snippets", -- Preconfigured snippets
		},
		config = function()
			-- Set up Mason
			require("mason").setup({
				ui = {
					icons = {
						package_installed = "✓",
						package_pending = "➜",
						package_uninstalled = "✗",
					},
				},
			})

			-- Capabilities for better completion
			local capabilities = vim.lsp.protocol.make_client_capabilities()

			-- Set up Mason LSP config
			require("mason-lspconfig").setup({
				-- List of LSP servers to automatically install
				ensure_installed = {
					"lua_ls", -- Lua
					"ts_ls", -- TypeScript/JavaScript
					"gopls", -- Go
					"cssls", -- CSS
					"html", -- HTML
					"pyright", -- Python
					"eslint", --Like... Everything...
					"emmet_language_server", -- JSX/TSX emmet auto complete functionality
				},
				automatic_installation = true,
				handlers = {
					-- Default handler for all servers
					function(server_name)
						require("lspconfig")[server_name].setup({
							capabilities = capabilities,
						})
					end,
					-- Custom handler for emmet with your specific config
					["emmet_language_server"] = function()
						require("lspconfig").emmet_language_server.setup({
							capabilities = capabilities,
							filetypes = {
								"css",
								"eruby",
								"html",
								"javascript",
								"javascriptreact",
								"less",
								"sass",
								"scss",
								"pug",
								"typescriptreact",
							},
							init_options = {
								includeLanguages = {},
								excludeLanguages = {},
								extensionsPath = {},
								preferences = {},
								showAbbreviationSuggestions = true,
								showExpandedAbbreviation = "always",
								showSuggestionsAsSnippets = false,
								syntaxProfiles = {},
								variables = {},
							},
						})
					end,
				},
			})

			require("mason-tool-installer").setup({
				ensure_installed = {
					-- Formatters
					"prettier", -- JavaScript/TypeScript/CSS/HTML formatter
					"stylua", -- Lua formatter
					"black", -- Python formatter
					"isort", -- Python import organizer
					"goimports", -- Go formatter and import organizer

					-- Linters
					"eslint_d", -- JavaScript/TypeScript linter (faster daemon version)
					"pylint", -- Python linter
				},
				auto_update = true,
				run_on_start = true, -- Install tools when Neovim starts
			})

			-- Set up LSP servers
			local lspconfig = require("lspconfig")

			-- Global LSP keybindings
			vim.keymap.set("n", "gD", vim.lsp.buf.declaration, { desc = "Go to declaration" })
			vim.keymap.set("n", "gd", vim.lsp.buf.definition, { desc = "Go to definition" })
			vim.keymap.set("n", "K", vim.lsp.buf.hover, { desc = "Hover documentation" })
			vim.keymap.set("n", "gi", vim.lsp.buf.implementation, { desc = "Go to implementation" })
			vim.keymap.set("n", "<leader>ca", vim.lsp.buf.code_action, { desc = "Code actions" })
			vim.keymap.set("n", "<leader>rn", vim.lsp.buf.rename, { desc = "Rename symbol" })
			vim.keymap.set("n", "gr", vim.lsp.buf.references, { desc = "Find references" })
			vim.keymap.set("n", "<leader>d", vim.diagnostic.open_float, { desc = "Show diagnostics" })
		end,
	},
}
