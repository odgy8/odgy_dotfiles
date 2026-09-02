-- Auto-configure pylsp to use the project venv if one exists
vim.api.nvim_create_autocmd("LspAttach", {
	buffer = 0,
	once = true,
	callback = function(args)
		local client = vim.lsp.get_client_by_id(args.data.client_id)
		if not client or client.name ~= "pylsp" then return end
		local root = client.root_dir or vim.fn.getcwd()
		local venv = root .. "/venv"
		if vim.fn.isdirectory(venv) == 1 then
			-- pylsp *replaces* its settings with whatever this notification carries,
			-- it does not merge. Sending only the jedi environment would drop the
			-- plugin config from mason.lua and hand back pycodestyle's 79 char E501s
			-- in every project that happens to have a ./venv, so extend the settings
			-- the client already has rather than sending a bare jedi table.
			local settings = vim.tbl_deep_extend("force", client.settings or {}, {
				pylsp = {
					plugins = { jedi = { environment = venv } },
				},
			})
			client.settings = settings
			client:notify("workspace/didChangeConfiguration", { settings = settings })
		end
	end,
})

-- Force formatoptions for Python files. This is pretty agressive, but seems like pytlsp is blocking the comments
-- stuff and it's annoying as hell
-- Directly set the string instead of using append/remove
vim.bo.formatoptions = "tqjcr1"

-- Also set it again on InsertEnter to catch any late overrides
vim.api.nvim_create_autocmd("InsertEnter", {
	buffer = 0,
	callback = function()
		vim.bo.formatoptions = "tqjcr1"
	end,
	once = true, -- Only need to do this once per buffer/file
})

-- And one more time with a delay just to be safe (it's really annoying!!!)
vim.defer_fn(function()
	vim.bo.formatoptions = "tqjcr1"
end, 500)

-- The major bit that we are interested in here is the "r". This essentially keeps us in "comment mode", so when
-- we are writing sudo code etc, we don't have to type a new comment every time. However, this is missing "o" which
-- would create a new comment line every time we press o or O for a new blank line, so it's als easy to escape the
-- comment blocks too.
