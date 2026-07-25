return {
	"sindrets/diffview.nvim",
	dependencies = "nvim-lua/plenary.nvim",
	config = function()
		require("diffview").setup({
			diff_binaries = false, -- Don't show diffs for binaries
			enhanced_diff_hl = false, -- Use better diff highlighting
			use_icons = true, -- Requires nvim-web-devicons

			view = {
				merge_tool = {
					layout = "diff3_mixed", -- Shows base, left, right in 3-way merge
				},
			},

			-- Add keymaps configuration
			keymaps = {
				view = {
					-- Add any view-specific mappings here
				},
				file_panel = {
					-- Add any file panel specific mappings here
				},
			},
		})

		-- Set up global keybindings for Diffview commands
		local keymap = vim.keymap.set

		-- Normal mode mappings with <leader>d prefix for diff operations
		keymap("n", "<leader>mo", ":DiffviewOpen<CR>", { desc = "DiffviewOpen" })
		keymap("n", "<leader>mc", ":DiffviewClose<CR>", { desc = "DiffviewClose" })
		keymap("n", "<leader>mt", ":DiffviewToggleFiles<CR>", { desc = "DiffviewToggleFiles" })
		keymap("n", "<leader>mf", ":DiffviewFocusFiles<CR>", { desc = "DiffviewFocusFiles" })
		keymap("n", "<leader>mr", ":DiffviewRefresh<CR>", { desc = "DiffviewRefresh" })

		-- If you want to add a keybind for viewing diff with HEAD
		keymap("n", "<leader>mh", ":DiffviewOpen HEAD<CR>", { desc = "DiffviewOpen HEAD" })

		-- If you want to add a keybind for viewing diff with specific commit
		keymap("n", "<leader>ml", ":DiffviewOpen HEAD~1<CR>", { desc = "DiffviewOpen last commit" })

		-- If you want to add a keybind for viewing diff with main
		keymap("n", "<leader>mm", ":DiffviewOpen main<CR>", { desc = "Diff with main branch" })
		keymap("n", "<leader>mM", ":DiffviewOpen origin/main<CR>", { desc = "Diff with origin/main" })
		keymap("n", "<leader>mb", ":DiffviewOpen main...HEAD<CR>", { desc = "Diff branch changes from main" })
	end,
}
