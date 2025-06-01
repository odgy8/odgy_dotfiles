return {
	{
		"mrjones2014/smart-splits.nvim",
		event = "VeryLazy",
		config = function()
			-- Window splitting commands
			vim.keymap.set("n", "<leader>wv", ":vsplit<CR>", { desc = "Split window vertically" })
			vim.keymap.set("n", "<leader>wh", ":split<CR>", { desc = "Split window horizontally" })
			vim.keymap.set("n", "<leader>wq", ":q<CR>", { desc = "Close window" })

			-- Set better split defaults
			vim.opt.splitbelow = true
			vim.opt.splitright = true

			local smart_splits = require("smart-splits")

			-- Moving between splits (keep these as they are)
			vim.keymap.set("n", "<C-h>", smart_splits.move_cursor_left)
			vim.keymap.set("n", "<C-j>", smart_splits.move_cursor_down)
			vim.keymap.set("n", "<C-k>", smart_splits.move_cursor_up)
			vim.keymap.set("n", "<C-l>", smart_splits.move_cursor_right)

			-- Quick window commands
			vim.keymap.set("n", "<C-w>z", "<C-w>|<C-w>_", { desc = "Zoom window" })
			vim.keymap.set("n", "<C-w>=", "<C-w>=", { desc = "Equal window size" })

			-- Store the original mappings
			local original_h = vim.fn.maparg("h", "n", false, true)
			local original_j = vim.fn.maparg("j", "n", false, true)
			local original_k = vim.fn.maparg("k", "n", false, true)
			local original_l = vim.fn.maparg("l", "n", false, true)

			-- Global state to track if we're in resize mode
			_G.in_resize_mode = false

			-- Function to exit resize mode
			_G.exit_resize_mode = function()
				-- Only proceed if we're actually in resize mode
				if not _G.in_resize_mode then
					return
				end

				-- Close the floating window and buffer
				if _G.resize_mode_win and vim.api.nvim_win_is_valid(_G.resize_mode_win) then
					vim.api.nvim_win_close(_G.resize_mode_win, true)
				end

				if _G.resize_mode_buf and vim.api.nvim_buf_is_valid(_G.resize_mode_buf) then
					vim.api.nvim_buf_delete(_G.resize_mode_buf, { force = true })
				end

				-- Reset hjkl keymaps to their defaults
				vim.keymap.del("n", "h")
				vim.keymap.del("n", "j")
				vim.keymap.del("n", "k")
				vim.keymap.del("n", "l")

				-- Restore original hjkl mappings if they existed
				if original_h and not vim.tbl_isempty(original_h) then
					vim.keymap.set("n", "h", original_h.rhs or "h", { silent = original_h.silent == 1 })
				end
				if original_j and not vim.tbl_isempty(original_j) then
					vim.keymap.set("n", "j", original_j.rhs or "j", { silent = original_j.silent == 1 })
				end
				if original_k and not vim.tbl_isempty(original_k) then
					vim.keymap.set("n", "k", original_k.rhs or "k", { silent = original_k.silent == 1 })
				end
				if original_l and not vim.tbl_isempty(original_l) then
					vim.keymap.set("n", "l", original_l.rhs or "l", { silent = original_l.silent == 1 })
				end

				-- Remove exit keymaps
				vim.keymap.del("n", "q")
				vim.keymap.del("n", "<Esc>")

				-- Reset state
				_G.in_resize_mode = false

				-- Provide feedback
				vim.cmd("echo 'Exited resize mode'")
			end

			-- Create a resize mode
			local function enter_resize_mode()
				-- Don't enter if already in resize mode
				if _G.in_resize_mode then
					return
				end

				_G.in_resize_mode = true

				-- Create a temporary buffer for showing resize mode
				local buf = vim.api.nvim_create_buf(false, true)
				local width = vim.api.nvim_get_option("columns")
				local height = vim.api.nvim_get_option("lines")

				-- Calculate floating window size and position
				local win_height = 3
				local win_width = 50
				local row = height - win_height - 3
				local col = math.floor((width - win_width) / 2)

				-- Set buffer content
				vim.api.nvim_buf_set_lines(buf, 0, -1, false, {
					"RESIZE MODE",
					"h/j/k/l: resize, C-h/j/k/l: navigate, q or <Esc>: exit",
				})

				-- Create floating window
				local win_opts = {
					relative = "editor",
					width = win_width,
					height = win_height,
					row = row,
					col = col,
					anchor = "NW",
					style = "minimal",
					border = "rounded",
				}

				local win = vim.api.nvim_open_win(buf, false, win_opts)
				vim.api.nvim_win_set_option(win, "winblend", 20)

				-- Store the window and buffer IDs globally
				_G.resize_mode_win = win
				_G.resize_mode_buf = buf

				-- Set up resize mode keymaps
				vim.keymap.set("n", "h", function()
					smart_splits.resize_left()
				end, { noremap = true, silent = true, desc = "Resize left" })
				vim.keymap.set("n", "j", function()
					smart_splits.resize_down()
				end, { noremap = true, silent = true, desc = "Resize down" })
				vim.keymap.set("n", "k", function()
					smart_splits.resize_up()
				end, { noremap = true, silent = true, desc = "Resize up" })
				vim.keymap.set("n", "l", function()
					smart_splits.resize_right()
				end, { noremap = true, silent = true, desc = "Resize right" })

				-- Set up exit mappings
				vim.keymap.set(
					"n",
					"q",
					_G.exit_resize_mode,
					{ noremap = true, silent = true, desc = "Exit resize mode" }
				)
				vim.keymap.set(
					"n",
					"<Esc>",
					_G.exit_resize_mode,
					{ noremap = true, silent = true, desc = "Exit resize mode" }
				)

				-- Display feedback
				vim.cmd("echo 'Entered resize mode'")
			end

			-- Map <leader>rr to enter resize mode
			vim.keymap.set("n", "<leader>rr", enter_resize_mode, { desc = "Enter window resize mode" })
		end,
	},
}
