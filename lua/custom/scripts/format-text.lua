local VS = require("custom.scripts.visual-selection")
local FT = {}

function FT.handleStringFormatBlock(converstionType)
	local vstart, vend, text = VS.getVisualSelectionBlock()

	-- we only have the two functions right now, will update if we add more
	if converstionType ~= "camel2snake" and converstionType ~= "snake2camel" then
		return text
	end

	for i = 1, #text do
		local transformed = ""
		if converstionType == "snake2camel" then
			transformed = FT.snake2camel(text[i])
		elseif converstionType == "camel2snake" then
			transformed = FT.camel2snake(text[i])
		end

		local lineNumber = vstart[1] + i - 1

		-- Get the actual line length to clamp the end column
		local line_content = vim.api.nvim_buf_get_lines(0, lineNumber - 1, lineNumber, false)[1]
		local line_len = #line_content
		local end_col = math.min(vend[2] + 1, line_len)

		vim.api.nvim_buf_set_text(
			0, -- current buffer
			lineNumber - 1, -- line (0-indexed)
			vstart[2], -- start column
			lineNumber - 1, -- end line (same line)
			end_col, -- end column (clamped to line length)
			{ transformed } -- replacement text (as table)
		)
	end
end

function FT.handleStringFormat(converstionType)
	local vstart, vend, text = VS.getVisualSelection()

	-- we only have the two functions right now, will update if we add more
	if converstionType ~= "camel2snake" and converstionType ~= "snake2camel" then
		return text
	end

	local out = text
	if converstionType == "camel2snake" then
		out = FT.camel2snake(text)
	elseif converstionType == "snake2camel" then
		out = FT.snake2camel(text)
	end

	vim.api.nvim_buf_set_text(0, vstart[1] - 1, vstart[2], vend[1] - 1, vend[2] + 1, vim.split(out, "\n"))
end

-- [[
-- This function is to split a single camelcase string into snake case
--
-- thisWillTurnIntoThis = this_will_turn_into_this
-- ]]
function FT.camel2snake(inputText)
	-- we need to substitite all occurances of uppercase chars (x) with _(x)
	-- %u matches upper case char's
	-- we capture the matched char by wrapping it in braces and it will be number 1
	-- if we did it again, or matched lower case with l, that would be 2
	-- we can put the captured char back into the string by just referencing %n
	-- similar to how an f string works in python
	local formatted = string.gsub(inputText, "(%u)", "_%1")
	-- now, we can return the string:lower()
	return formatted:lower()
end

-- [[
-- This function is to split a single camelcase string into snake case
--
-- thisWillTurnInto_this = thisWillTurnIntoThis
-- ]]
function FT.snake2camel(inputText)
	-- we need to replace the `_` with `` and upper case the next char
	-- gsub can take a function a
	local function upperCase(char)
		return char:upper()
	end

	return string.gsub(inputText, "_(%l)", upperCase)
end

return FT