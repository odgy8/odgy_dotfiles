return {
	"nvim-telescope/telescope.nvim",
	tag = "0.1.8",
	dependencies = {
		"nvim-lua/plenary.nvim",
		{
			"nvim-telescope/telescope-fzf-native.nvim",
			build = "make",
		},
	},
	config = function()
		local telescope = require("telescope")
		local actions = require("telescope.actions")
		colorscheme = "dracula"

		-- Set up highlight groups
		vim.api.nvim_set_hl(0, "TelescopeNormal", { bg = "none" }) -- Main telescope window
		-- vim.api.nvim_set_hl(0, "TelescopeBorder", { bg = "#000000" })          -- Borders
		-- vim.api.nvim_set_hl(0, "TelescopePromptNormal", { bg = "#000000" })    -- Prompt window
		-- vim.api.nvim_set_hl(0, "TelescopePromptBorder", { bg = "#000000" })
		-- vim.api.nvim_set_hl(0, "TelescopePromptTitle", { bg = "#000000", fg = "#ffffff" })
		-- vim.api.nvim_set_hl(0, "TelescopePreviewTitle", { bg = "#000000", fg = "#ffffff" })
		-- vim.api.nvim_set_hl(0, "TelescopeResultsTitle", { bg = "#000000", fg = "#ffffff" })

		telescope.setup({
			defaults = {
				layout_config = {
					horizontal = {
						prompt_position = "bottom",
						preview_width = 0.55,
						results_width = 0.8,
					},
					vertical = {
						mirror = false,
					},
					width = 0.87,
					height = 0.80,
					preview_cutoff = 120,
				},

				-- Make borders look nicer
				borderchars = {
					prompt = { "─", "│", "─", "│", "╭", "╮", "╯", "╰" },
					results = { "─", "│", "─", "│", "╭", "╮", "╯", "╰" },
					preview = { "─", "│", "─", "│", "╭", "╮", "╯", "╰" },
				},

				winblend = 0,

				path_display = { "truncate" },
				mappings = {
					i = {
						-- ["<C-k>"] = actions.move_selection_previous,
						-- ["<C-j>"] = actions.move_selection_next,
						-- ["<C-q>"] = actions.send_selected_to_qflist + actions.open_qflist,
					},
				},
			},
		})

		-- Enable telescope fzf native
		telescope.load_extension("fzf")

		-- Keymaps
		local builtin = require("telescope.builtin")
		vim.keymap.set("n", "<leader><leader>", builtin.find_files, { desc = "Find files" })
		vim.keymap.set("n", "<leader>fg", builtin.git_files, { desc = "Find files" })
		vim.keymap.set("n", "<leader>ps", builtin.live_grep, { desc = "Live grep" })
	end,
}
