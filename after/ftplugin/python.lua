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
