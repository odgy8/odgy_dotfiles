local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
	vim.fn.system({
		"git",
		"clone",
		"--filter=blob:none",
		"https://github.com/folke/lazy.nvim.git",
		"--branch=stable",
		lazypath,
	})
end
vim.opt.rtp:prepend(lazypath)

vim.g.mapleader = " " -- Use space as leader key
vim.g.maplocalleader = " "

-- Basic options
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.mouse = "a"
vim.opt.showmode = false
vim.opt.clipboard = "unnamedplus"
vim.opt.breakindent = true
vim.opt.undofile = true
vim.opt.ignorecase = true
vim.opt.smartcase = true
vim.opt.signcolumn = "yes"
vim.opt.updatetime = 250
vim.opt.timeout = true
vim.opt.timeoutlen = 300
vim.opt.tabstop = 2
vim.opt.softtabstop = 2
vim.opt.shiftwidth = 2
vim.opt.expandtab = true
vim.opt.smartindent = true
vim.opt.scrolloff = 12
vim.opt.colorcolumn = "120"

vim.api.nvim_create_autocmd("FileType", {
	pattern = "*",
	callback = function()
		vim.opt.formatoptions:remove({ "r", "o" })
	end,
})

-- Initialize lazy.nvim
require("lazy").setup({
	-- Plugins will go here
	{ import = "custom.plugins" },
}, {
	install = {
		-- Install missing plugins on startup
		missing = true,
	},
	change_detection = {
		-- Automatically check for config file changes
		enabled = true,
		notify = true,
	},
})

-- Function to reset diagnostic display and restart LSP
function ResetLspDiagnostics()
	-- Reset diagnostic configuration with all display options enabled
	vim.diagnostic.config({
		underline = true,
		virtual_text = true,
		signs = true,
		float = {
			border = "rounded",
			focusable = false,
			source = "always",
		},
	})

	-- Restart all LSP clients
	vim.cmd("LspRestart")

	-- Optional: Display a confirmation message
	print("LSP diagnostics reset and servers restarted!")
end

-- Function to start the LSP fix on nvim startup
vim.api.nvim_create_autocmd("LspAttach", {
	callback = function()
		-- Use a timer to ensure all LSP servers are fully initialized
		vim.defer_fn(function()
			-- Only set the diagnostic config, don't restart LSP since they just started
			vim.diagnostic.config({
				underline = true,
				virtual_text = true,
				signs = true,
				float = {
					border = "rounded",
					focusable = false,
					source = "always",
				},
			})
			print("LSP diagnostic settings applied automatically!")
		end, 1000) -- 1 second delay
	end,
	-- Run once only
	once = true,
})

-- Create a user command to easily call this function
vim.api.nvim_create_user_command("CustomLspRestart", function()
	ResetLspDiagnostics()
end, {})

-- Import custom keybinds.
require("custom.settings.keybinds").setup()
