return {
	"goolord/alpha-nvim",
	dependencies = { "nvim-tree/nvim-web-devicons" },
	config = function()
		local alpha = require("alpha")
		local dashboard = require("alpha.themes.dashboard")
		local generateText = require("custom.scripts.generateId")

		-- Get current working directory name
		local function get_project_name()
			local cwd = vim.fn.getcwd()
			return vim.fn.fnamemodify(cwd, ":t")
		end

		-- Get last modified file
		local function get_last_modified()
			local handle = io.popen("ls -t | head -n 1")
			if handle then
				local result = handle:read("*a")
				handle:close()
				return result:gsub("^%s*(.-)%s*$", "%1")
			end
			return ""
		end

		-- Function to get project statistics
		local function get_project_stats()
			local stats = {
				files = "0",
				commits = "0",
				branches = "0",
				contributors = "0",
			}

			-- Check if we're in a git repository
			local is_git = vim.fn.system("git rev-parse --is-inside-work-tree 2>/dev/null"):find("true")

			if is_git then
				stats.files = vim.fn.system("git ls-files 2>/dev/null | wc -l"):gsub("^%s*(.-)%s*$", "%1")
				stats.commits = vim.fn.system("git rev-list --count HEAD 2>/dev/null"):gsub("^%s*(.-)%s*$", "%1")
				stats.branches = vim.fn.system("git branch --list 2>/dev/null | wc -l"):gsub("^%s*(.-)%s*$", "%1")
			end

			return {
				"┌ Project Overview ──────────────────────",
				"│",
				"├─ 📂 Project: " .. get_project_name(),
				"├─ 📝 Last Modified: " .. get_last_modified(),
				"├─ ⏰ Current Time: " .. os.date("%H:%M:%S"),
				"├─ 📅 Date: " .. os.date("%A, %d %B %Y"),
				"│",
				"├ Git Statistics ────────────────────────",
				"│",
				"├─ 📊 Repository Stats:",
				"│  ├─ 📂 Tracked Files: " .. stats.files,
				"│  ├─ 🔀 Branches: " .. stats.branches,
				"│  ├─ 📝 Commits: " .. stats.commits,
				"│  └─ 👥 Contributors: " .. stats.contributors,
				"│",
				"└────────────────────────────────────────",
			}
		end

		-- Random programming tips
		local function get_last_commit()
			local subject = vim.fn.system("git log -1 --pretty='%s' 2>/dev/null"):gsub("^%s*(.-)%s*$", "%1")
			local date = vim.fn
				.system("git log -1 --pretty='%cd' --date=format:'%A, %d %B %Y at %H:%M' 2>/dev/null")
				:gsub("^%s*(.-)%s*$", "%1")

			if subject == "" then
				return { "💬 No recent commits" }
			end

			local prefix = "💬 "
			local max_width = 42
			local words = {}
			for word in subject:gmatch("%S+") do
				table.insert(words, word)
			end

			local lines = {}
			table.insert(lines, "📅 " .. date)
			local current_line = prefix
			for _, word in ipairs(words) do
				if #current_line + #word + 1 > max_width then
					table.insert(lines, current_line)
					current_line = "   " .. word
				else
					if current_line == prefix then
						current_line = current_line .. word
					else
						current_line = current_line .. " " .. word
					end
				end
			end
			table.insert(lines, current_line)

			return lines
		end

		local welcomeText = generateText.generateWelcome()

		-- Cool ASCII art header
		dashboard.section.header.val = {
			[[                   ,,,, ]],
			[[             ,;) .';;;;',]],
			[[ ;;,,_,-.-.,;;'_,|I\;;;/),,_]],
			[[  `';;/:|:);{ ;;;|| \;/ /;;;\__]],
			[[      L;/-';/ \;;\',/;\/;;;.') \]],
			[[      .:`''` - \;;'.__/;;;/  . _'-._ ]],
			[[    .'/   \     \;;;;;;/.'_7:.  '). \_]],
			[[  .''/     | '._ );}{;//.'    '-:  '.,L]],
			[[.'. /       \  ( |;;;/_/         \._./;\   _,]],
			[[ . /        |\ ( /;;/_/             ';;;\,;;_,]],
			[[. /         )__(/;;/_/                (;;''''']],
			[[ /        _;:':;;;;:';-._             );]],
			[[/        /   \  `'`   --.'-._         \/]],
			[[       .'     '.  ,'         '-,]],
			[[      /    /   r--,..__       '.\]],
			[[    .'    '  .'        '--._     |]],
			[[    (     :.(;>        _ .' '- ;/]],
			[[    |      /:;(    ,_.';(   __.']],
			[[     '- -'"|;:/    (;;;;-'--']],
			[[           |;/      ;;(]],
			[[           ''      /;;|]],
			[[                   \;;|]],
			[[                    \/]],
		}

		dashboard.section.footer.val = function()
			local lines = vim.list_extend({
				welcomeText,
				"",
			}, get_last_commit())
			vim.list_extend(lines, { "" })
			vim.list_extend(lines, get_project_stats())
			return lines
		end

		-- Layout with proper spacing
		dashboard.config.layout = {
			{ type = "padding", val = 2 },
			dashboard.section.header,
			{ type = "padding", val = 2 },
			dashboard.section.footer,
		}

		alpha.setup(dashboard.config)

		vim.api.nvim_create_autocmd("User", {
			pattern = "AlphaReady",
			callback = function()
				_G.alpha_timer = vim.loop.new_timer()
				_G.alpha_timer:start(
					0,
					1000,
					vim.schedule_wrap(function()
						if vim.bo.filetype == "alpha" then
							alpha.redraw()
						end
					end)
				)
			end,
		})

		vim.api.nvim_create_autocmd("User", {
			pattern = "AlphaClosed",
			callback = function()
				if _G.alpha_timer then
					_G.alpha_timer:stop()
					_G.alpha_timer:close()
				end
			end,
		})

		vim.api.nvim_create_autocmd("User", {
			pattern = "AlphaReady",
			callback = function()
				_G.alpha_timer = vim.loop.new_timer()
				_G.alpha_timer:start(
					0,
					60000,
					vim.schedule_wrap(function()
						if vim.bo.filetype == "alpha" then
							alpha.redraw()
						end
					end)
				)
			end,
		})
	end,
}
