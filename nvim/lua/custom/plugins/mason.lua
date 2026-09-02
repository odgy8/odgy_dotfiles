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
					-- "pyright", -- Python -- Disabled in favor of python-lsp-server
					"pylsp", -- Python LSP Server
					"ruff", -- Python linter/formatter LSP (diagnostics for Python)
					"eslint", --Like... Everything...
					"emmet_language_server", -- JSX/TSX emmet auto complete functionality
					"intelephense", -- PHP
				},
			})

			-- Per-server configuration.
			-- mason-lspconfig v2 dropped the `handlers` table - it now only installs
			-- servers and auto-enables them via vim.lsp.enable(). Anything passed as
			-- `handlers` (or `automatic_installation`) is silently ignored, so per-server
			-- settings have to go through vim.lsp.config() like qmlls below.
			vim.lsp.config("*", {
				capabilities = capabilities,
			})

			-- Python: ruff owns the diagnostics, pylsp owns everything else (jedi
			-- completion, hover, rename, go-to-definition).
			-- pylsp's built-in linters don't read pyproject.toml, so pycodestyle lints at
			-- its own hardcoded 79 char default and double-reports E501 against whatever
			-- ruff has already said about the same line at the project's real line-length.
			vim.lsp.config("pylsp", {
				settings = {
					pylsp = {
						plugins = {
							pycodestyle = { enabled = false },
							pyflakes = { enabled = false },
							mccabe = { enabled = false },
							flake8 = { enabled = false },
							pylint = { enabled = false },
							autopep8 = { enabled = false },
							yapf = { enabled = false },
						},
					},
				},
			})

			-- ruff picks up each project's own [tool.ruff] from pyproject.toml/ruff.toml.
			-- This block is only for the things that are wrong everywhere rather than
			-- wrong in one repo: B008 fires on FastAPI's `x = Depends(...)` parameter
			-- defaults, which is the framework's documented idiom, not a mutable-default
			-- bug. Treating those constructors as immutable calls is the fix ruff
			-- documents for it.
			vim.lsp.config("ruff", {
				init_options = {
					settings = {
						configuration = {
							lint = {
								["flake8-bugbear"] = {
									["extend-immutable-calls"] = {
										"fastapi.Depends",
										"fastapi.Query",
										"fastapi.Path",
										"fastapi.Body",
										"fastapi.Cookie",
										"fastapi.Header",
										"fastapi.Form",
										"fastapi.File",
										"fastapi.Security",
									},
								},
							},
						},
						-- A repo's own config wins over the block above if they disagree.
						configurationPreference = "filesystemFirst",
					},
				},
			})

			vim.lsp.config("emmet_language_server", {
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
			require("mason-tool-installer").setup({
				ensure_installed = {
					-- Formatters
					"prettier", -- JavaScript/TypeScript/CSS/HTML formatter
					"stylua", -- Lua formatter
					"black", -- Python formatter
					"isort", -- Python import organizer
					"goimports", -- Go formatter and import organizer
					-- commenting out for local dev, needed for work only
					--"pint", -- PHP/Laravel formatter
					"blade-formatter", -- Laravel Blade templates
					-- Linters
					"eslint_d", -- JavaScript/TypeScript linter (faster daemon version)
					"pylint", -- Python linter
				},
				auto_update = true,
				run_on_start = true, -- Install tools when Neovim starts
			})
			-- Set up LSP servers
			vim.lsp.config("qmlls", {})
			vim.lsp.enable("qmlls")
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
