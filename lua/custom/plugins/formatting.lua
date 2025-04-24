return {
	-- Formatting
	{
		"stevearc/conform.nvim",
		event = { "BufReadPre", "BufNewFile" },
		dependencies = {
			"mason.nvim",
		},
		config = function()
			require("conform").setup({
				formatters_by_ft = {
					javascript = { "prettier", "eslint" },
					javascriptreact = { "prettier", "eslint" },
					typescript = { "prettier", "eslint" },
					typescriptreact = { "prettier", "eslint" },
					css = { "prettier" },
					scss = { "prettier" },
					sass = { "prettier" },
					go = { "goimports" },
					lua = { "stylua" },
					python = { "black", "isort" },
				},
				format_on_save = {
					timeout_ms = 2000,
					lsp_fallback = true,
					async = false,
				},
			})

			-- Optional: Add key mappings for manual formatting
			vim.keymap.set("n", "<leader>ff", function()
				require("conform").format({ timeout_ms = 2000 })
			end, { desc = "Format file" })
		end,
	},

	-- Diagnostics (linting)
	{
		"mfussenegger/nvim-lint",
		event = { "BufReadPre", "BufNewFile" },
		config = function()
			local lint = require("lint")

			lint.linters_by_ft = {
				javascript = { "eslint" },
				javascriptreact = { "eslint" },
				typescript = { "eslint" },
				typescriptreact = { "eslint" },
				python = { "pylint" },
			}

			-- Set up lint on save
			vim.api.nvim_create_autocmd({ "BufWritePost", "BufReadPost", "InsertLeave" }, {
				callback = function()
					require("lint").try_lint()
				end,
			})
		end,
	},
}
-- return {
--   {
--     "nvimtools/none-ls.nvim",  -- Changed from jose-elias-alvarez/null-ls.nvim
--     event = { "BufReadPre", "BufNewFile" },
--     dependencies = {
--       "mason.nvim",
--     },
--     config = function()
--       local null_ls = require("none-ls")  -- Changed from null-ls to none-ls
--       local formatting = null_ls.builtins.formatting
--       local diagnostics = null_ls.builtins.diagnostics
--       null_ls.setup({
--         sources = {
--           require("none-ls.diagnostics.eslint"),
--           -- JavaScript/TypeScript/React formatting and linting
--           formatting.prettier.with({
--             filetypes = {
--               "javascript",
--               "javascriptreact",
--               "typescript",
--               "typescriptreact",
--               "css",
--               "scss",
--               "sass",
--             },
--           }),
--           diagnostics.eslint.with({
--             filetypes = {
--               "javascript",
--               "javascriptreact",
--               "typescript",
--               "typescriptreact",
--             },
--           }),
--           formatting.eslint.with({
--             filetypes = {
--               "javascript",
--               "javascriptreact",
--               "typescript",
--               "typescriptreact",
--             },
--           }),
--           -- Go formatting
--           formatting.goimports,
--         },
--       })
--       -- Set up autoformatting
--       vim.api.nvim_create_autocmd("BufWritePre", {
--         pattern = {
--           "*.js", "*.jsx", "*.ts", "*.tsx",
--           "*.css", "*.scss", "*.sass",
--           "*.go"
--         },
--         callback = function()
--           vim.lsp.buf.format({ timeout_ms = 2000 })
--         end,
--       })
--       -- Optional: Add key mappings for manual formatting
--       vim.keymap.set('n', '<leader>ff', function()
--         vim.lsp.buf.format({ timeout_ms = 2000 })
--       end, { desc = "Format file" })
--     end,
--   }
-- }
