local M = {}

function M.sayHello()
    return "Hi there Sam!"
end

function M.generateId()
    -- Get a random number seed thingy
    math.randomseed(os.time())

    -- List available character
    local availChar = { "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s",
        "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P",
        "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0" }

    local strArr = {}
    for i = 1, 15 do
        -- Generate a random number (corrected range)
        local randNum = math.random(1, #availChar)
        strArr[i] = availChar[randNum]
    end

    -- Return the generated id as a string
    return table.concat(strArr)
end

function M.generateWelcome()
    -- Get hour of day
    local hour = tonumber(os.date("%H"))

    if hour < 12 then
        return "Good Morning Sam"
    elseif hour < 18 then
        return "Good Afternoon Sam"
    else
        return "Good Evening Sam"
    end
end

return M
