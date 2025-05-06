return {
	{
		"mrjones2014/smart-splits.nvim",
		event = "VeryLazy",
		config = function()
			-- Better window creation with same keybinds you would have used in tmux
			-- vim.keymap.set('n', '<C-w>|', ':vsplit<CR>', { desc = 'Split window vertically' })
			-- vim.keymap.set('n', '<C-w>-', ':split<CR>', { desc = 'Split window horizontally' })
			vim.keymap.set("n", "<leader>wv", ":vsplit<CR>", { desc = "Split window vertically" })
			vim.keymap.set("n", "<leader>wh", ":split<CR>", { desc = "Split window horizontally" })
			vim.keymap.set("n", "<leader>wq", ":q<CR>", { desc = "Split window horizontally" })

			-- Set better split defaults
			vim.opt.splitbelow = true
			vim.opt.splitright = true

			local smart_splits = require("smart-splits")

			-- Keymaps for resizing splits
			vim.keymap.set("n", "<A-h>", smart_splits.resize_left)
			vim.keymap.set("n", "<A-j>", smart_splits.resize_down)
			vim.keymap.set("n", "<A-k>", smart_splits.resize_up)
			vim.keymap.set("n", "<A-l>", smart_splits.resize_right)

			-- Moving between splits
			vim.keymap.set("n", "<C-h>", smart_splits.move_cursor_left)
			vim.keymap.set("n", "<C-j>", smart_splits.move_cursor_down)
			vim.keymap.set("n", "<C-k>", smart_splits.move_cursor_up)
			vim.keymap.set("n", "<C-l>", smart_splits.move_cursor_right)

			-- Quick window commands
			vim.keymap.set("n", "<C-w>z", "<C-w>|<C-w>_", { desc = "Zoom window" })
			vim.keymap.set("n", "<C-w>=", "<C-w>=", { desc = "Equal window size" })
		end,
	},
}
