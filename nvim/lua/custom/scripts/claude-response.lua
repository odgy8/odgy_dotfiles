local M = {}

-- Claude Code stores each session as JSONL under
-- <config-dir>/projects/<launch-cwd with every non-alphanumeric char as "-">/
-- The format is internal to Claude Code and can change between releases.

local function sanitise(path)
	local name = path:gsub("[^%w]", "-")
	return name
end

-- Every ~/.claude* config dir, so it does not matter which alias/config
-- started the session. $CLAUDE_CONFIG_DIR covers a dir outside home.
local function config_roots()
	local roots = vim.fn.glob(vim.fn.expand("~") .. "/.claude*", false, true)
	local env = vim.env.CLAUDE_CONFIG_DIR
	if env and env ~= "" then
		table.insert(roots, vim.fn.expand(env))
	end
	return roots
end

-- cwd first, then each parent - nvim is often deeper in the tree than the
-- dir claude was launched from.
local function cwd_chain()
	local chain = { vim.fn.getcwd() }
	local dir = chain[1]
	while true do
		local parent = vim.fn.fnamemodify(dir, ":h")
		if parent == dir then
			return chain
		end
		table.insert(chain, parent)
		dir = parent
	end
end

-- Newest .jsonl for the closest matching dir. Returns nil if nothing matches.
local function session_file()
	local roots = config_roots()
	for _, dir in ipairs(cwd_chain()) do
		local project = "/projects/" .. sanitise(dir) .. "/*.jsonl"
		local newest, newest_mtime = nil, -1
		for _, root in ipairs(roots) do
			for _, file in ipairs(vim.fn.glob(root .. project, false, true)) do
				local mtime = vim.fn.getftime(file)
				if mtime > newest_mtime then
					newest, newest_mtime = file, mtime
				end
			end
		end
		if newest then
			return newest
		end
	end
end

-- Decoded message table for a top level assistant line, else nil. Subagent
-- output (isSidechain) is skipped.
local function assistant_message(line)
	local ok, entry = pcall(vim.json.decode, line)
	if not ok or type(entry) ~= "table" then
		return nil
	end
	if entry.type ~= "assistant" or entry.isSidechain == true then
		return nil
	end
	local msg = entry.message
	if type(msg) ~= "table" or type(msg.content) ~= "table" then
		return nil
	end
	return msg
end

local function text_blocks(msg)
	local texts = {}
	for _, block in ipairs(msg.content) do
		if block.type == "text" and type(block.text) == "string" and block.text:match("%S") then
			table.insert(texts, block.text)
		end
	end
	return texts
end

local function last_response(path)
	local lines = vim.fn.readfile(path)
	local texts, target = {}, nil
	-- One API response is written as several lines, one per content block,
	-- all sharing message.id. Walk back from the end until the id changes.
	for i = #lines, 1, -1 do
		local msg = assistant_message(lines[i])
		if msg then
			if target and msg.id ~= target then
				break
			end
			local chunk = text_blocks(msg)
			if #chunk > 0 then
				target = target or msg.id
				for j = #chunk, 1, -1 do
					table.insert(texts, 1, chunk[j])
				end
			end
		end
	end
	if #texts == 0 then
		return nil
	end
	return table.concat(texts, "\n\n")
end

-- Last thing Claude said in the newest session for this cwd. Notifies and
-- returns nil when there is nothing to fetch.
function M.get()
	local file = session_file()
	if not file then
		vim.notify("No Claude session found for " .. vim.fn.getcwd(), vim.log.levels.WARN)
		return nil
	end
	local text = last_response(file)
	if not text then
		vim.notify("No assistant text in " .. file, vim.log.levels.WARN)
		return nil
	end
	return text
end

function M.copy()
	local text = M.get()
	if not text then
		return
	end
	vim.fn.setreg('"', text)
	vim.fn.setreg("+", text)
	vim.notify("Copied last Claude response (" .. #vim.split(text, "\n") .. " lines)")
end

function M.paste()
	local text = M.get()
	if not text then
		return
	end
	vim.fn.setreg('"', text)
	vim.fn.setreg("+", text)
	vim.api.nvim_put(vim.split(text, "\n"), "l", true, true)
end

return M
