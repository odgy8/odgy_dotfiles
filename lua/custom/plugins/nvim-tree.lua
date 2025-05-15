return {
	"nvim-tree/nvim-tree.lua",
	version = "*",
	lazy = false,
	dependencies = {
		"nvim-tree/nvim-web-devicons", -- optional but recommended for file icons
	},
	config = function()
		-- Disable netrw
		vim.g.loaded_netrw = 1
		vim.g.loaded_netrwPlugin = 1

		require("nvim-tree").setup({
			view = {
				width = 50,
				relativenumber = true,
				side = "right",
			},
			renderer = {
				group_empty = true,
				highlight_git = true,
				icons = {
					show = {
						file = true,
						folder = true,
						folder_arrow = true,
						git = true,
					},
				},
			},
			filters = {
				dotfiles = false, -- Hide dotfiles
				exclude = { ".env" }, -- Show .env filed
			},
			git = {
				enable = true,
				ignore = false, -- Show git ignored files
			},
			actions = {
				open_file = {
					window_picker = {
						enable = false, -- Open files in the last focused window
					},
					quit_on_open = false, -- Don't close NvimTree when opening a file
				},
			},
			update_focused_file = {
				enable = true,
				update_root = true,
			},
		})

		-- Set keymaps
		vim.keymap.set("n", "<leader>e", ":NvimTreeToggle<CR>", { desc = "Toggle file explorer", silent = true })
		vim.keymap.set("n", "<leader>fe", ":NvimTreeFocus<CR>", { desc = "Focus file explorer", silent = true })
	end,
}
