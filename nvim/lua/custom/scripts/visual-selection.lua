local VS = {}

function VS.getVisualSelection()
	-- Use getpos to get live visual selection
	local v_start = vim.fn.getpos('v')
	local v_end = vim.fn.getpos('.')

	-- Extract line and column (getpos returns {bufnum, lnum, col, off})
	-- Column is 1-indexed, convert to 0-indexed for the API
	local vstart = {v_start[2], v_start[3] - 1}
	local vend = {v_end[2], v_end[3] - 1}

	-- if we selected in reverse then we need to swap the numbers
	if vstart[1] > vend[1] or (vstart[1] == vend[1] and vstart[2] > vend[2]) then
		vstart, vend = vend, vstart
	end

	local lines = vim.api.nvim_buf_get_text(0, vstart[1] - 1, vstart[2], vend[1] - 1, vend[2] + 1, {})
	return vstart, vend, table.concat(lines, "\n")
end

function VS.getVisualSelectionBlock()
	-- Use getpos to get live visual selection instead of marks
	-- 'v' gives the start of visual area, '.' gives cursor position
	local v_start = vim.fn.getpos('v')
	local v_end = vim.fn.getpos('.')

	-- Extract line and column (getpos returns {bufnum, lnum, col, off})
	-- Column is 1-indexed, convert to 0-indexed for the API
	local vstart = {v_start[2], v_start[3] - 1}
	local vend = {v_end[2], v_end[3] - 1}

	-- if we selected in reverse then we need to swap the numbers
	if vstart[1] > vend[1] or (vstart[1] == vend[1] and vstart[2] > vend[2]) then
		vstart, vend = vend, vstart
	end

	local lines = {}
	for line_num = vstart[1], vend[1] do
		-- Get the actual line to check its length
		local line_content = vim.api.nvim_buf_get_lines(0, line_num - 1, line_num, false)[1]
		local line_len = #line_content

		-- Clamp the end column to the actual line length
		local end_col = math.min(vend[2] + 1, line_len)

		local line_text = vim.api.nvim_buf_get_text(0, line_num - 1, vstart[2], line_num - 1, end_col, {})
		table.insert(lines, line_text[1] or "")
	end

	return vstart, vend, lines
end

return VS
