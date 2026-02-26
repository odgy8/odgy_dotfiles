local function read_json_file(path)
	if vim.fn.filereadable(path) == 0 then
		return nil
	end

	local lines = vim.fn.readfile(path)
	local ok, decoded = pcall(vim.json.decode, table.concat(lines, "\n"))
	if not ok or type(decoded) ~= "table" then
		return nil
	end

	return decoded
end

local function get_psr4_mappings(root)
	local composer = read_json_file(root .. "/composer.json")
	if not composer then
		return {}
	end

	local mappings = {}

	local function add_psr4(autoload)
		if type(autoload) ~= "table" then
			return
		end

		local psr4 = autoload["psr-4"]
		if type(psr4) ~= "table" then
			return
		end

		for prefix, dirs in pairs(psr4) do
			if type(dirs) == "string" then
				dirs = { dirs }
			end

			if type(dirs) == "table" then
				for _, dir in ipairs(dirs) do
					if type(dir) == "string" then
						table.insert(mappings, {
							prefix = prefix,
							dir = dir,
						})
					end
				end
			end
		end
	end

	add_psr4(composer.autoload)
	add_psr4(composer["autoload-dev"])

	table.sort(mappings, function(a, b)
		return #a.prefix > #b.prefix
	end)

	return mappings
end

local function normalize_symbol(raw)
	if not raw or raw == "" then
		return nil
	end

	local symbol =
		raw:gsub("^['\"`({%[]+", ""):gsub("['\"`)}%],:;]+$", ""):gsub("@.*$", ""):gsub("\\\\", "\\"):gsub("^\\+", "")

	if symbol == "" then
		return nil
	end

	-- Match PHP-like FQCN namespace text, e.g. App\GraphQL\Queries\UserResolver.
	if not symbol:match("^[%a_\\][%w_\\]*$") then
		return nil
	end

	return symbol
end

local function file_exists(path)
	return vim.fn.filereadable(path) == 1
end

local function join_paths(...)
	local parts = { ... }
	return (table.concat(parts, "/"):gsub("//+", "/"))
end

local function resolve_with_psr4(root, symbol)
	local mappings = get_psr4_mappings(root)
	for _, mapping in ipairs(mappings) do
		if vim.startswith(symbol, mapping.prefix) then
			local remainder = symbol:sub(#mapping.prefix + 1)
			local relative = remainder:gsub("\\", "/") .. ".php"
			local candidate = join_paths(root, mapping.dir, relative)

			if file_exists(candidate) then
				return candidate
			end
		end
	end
end

local function resolve_with_fallback_search(root, symbol)
	local class = symbol:match("([^\\]+)$")
	if not class then
		return nil
	end

	local candidates = vim.fs.find(class .. ".php", {
		path = root,
		upward = false,
		type = "file",
		limit = 20,
	})

	return candidates[1]
end

local function resolve_php_file(symbol)
	local root = vim.fs.root(0, { "composer.json", ".git", "artisan" }) or vim.fn.getcwd()
	return resolve_with_psr4(root, symbol) or resolve_with_fallback_search(root, symbol)
end

local function graphql_goto_definition()
	local symbol = normalize_symbol(vim.fn.expand("<cWORD>"))
	if symbol then
		local target = resolve_php_file(symbol)
		if target then
			vim.cmd("edit " .. vim.fn.fnameescape(target))
			return
		end
	end

	if #vim.lsp.get_clients({ bufnr = 0 }) > 0 then
		vim.lsp.buf.definition()
		return
	end

	vim.notify("No PHP class path or active LSP definition found.", vim.log.levels.WARN)
end

vim.keymap.set("n", "gd", graphql_goto_definition, {
	buffer = true,
	silent = true,
	desc = "GraphQL: Go to PHP definition",
})
