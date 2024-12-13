// game classes

let rooms = []

class Room {
    constructor(id, exits, identifier, description, children) {
        this.className = "Room"

        this.id = id || "Room"
        this.exits = exits || {}
        this.staticIdentifier = identifier || "You are in a room."
        this.entryIdentifier = identifier || "You have entered a room."
        this.description = description || "This is just a random room"
    }
}

let items = []

class Item {
    constructor(id, description) {
        this.className = "Item"

        this.id = id || "Item"
        this.description = description || "This is an item."

        items.push(this)
    }
}

let players = []

class Player {
    constructor(startRoom) {
        this.className = "Player"

        this.money = 5
        this.energy = 30
        this.currentRoom = startRoom || "apartment"

        players.push(this)
    }

    move(direction) {
        if (!this.currentRoom) {
            return
        }

        let currentRoom = GetRoomById(this.currentRoom)

        if (!currentRoom) {
            return
        }

        let exit = currentRoom.exits[direction]

        if (!exit) {
            return
        }

        this.energy -= 1
        this.currentRoom = exit

        currentTime += 0.5
    }

    teleport(room) {
        let roomData = GetRoomById(room)

        if (roomData) {
            this.currentRoom = room
        }
    }
}

let objects = []

class Object {
    constructor(id) {
        this.className = "Object"

        this.id = id || "Object"

        objects.push(this)
    }
}

// room functions

function AddRoom(id, exits, identifier, description) {
    let newRoom = new Room(id, exits, identifier, description)

    rooms.push(newRoom)

    return newRoom
}

function GetRoomById(id) {
    for (let i = 0; i < rooms.length; ++i) {
        let currentRoom = rooms[i]

        if (currentRoom.id == id) {
            return currentRoom
        }
    }
}

function getItemsInRoom(room) {
    let roomItems = []

    for (let i = 0; i < items.length; ++i) {
        let currentItem = items[i]

        if (currentItem.parent == room && currentItem.className == "Item") {
            roomItems.push(currentItem)
        }
    }

    return roomItems
}

function getObjectsInRoom(room) {
    let roomObjects = []

    for (let i = 0; i < objects.length; ++i) {
        let currentObject = objects[i]

        if (currentObject.parent == room && currentObject.className == "Object") {
            roomObjects.push(currentObject)
        }
    }

    return roomObjects
}

function getNPCsInRoom(room) {
    let roomNPCs = []

    for (let i = 0; i < players.length; ++i) {
        let currentNPC = players[i]

        if (currentNPC.parent == room && currentNPC.className == "Player" && currentNPC != player) {
            roomNPCs.push(currentNPC)
        }
    }

    return roomNPCs
}

// game variables

let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

let currentDay = 5
let currentDayName = "Saturday"
let currentTime = 8

function incrementDay() {
    currentDay++

    if (currentDay > 6) {
        currentDay = 0
    }

    currentDayName = days[currentDay]
}

function get24hrTime() {

    let split = currentTime.toString().split(".")
    let remainder = Number(split[1])
    remainder /= 5 / 3
    remainder = Math.round(remainder)

    return split[0] + (split[1] && ":" + remainder.toString() + "0" || ":00")
}

function readOutTime() {
    return writeMultipleLines([
        "Today is " + currentDayName + ".",
        "The time is " + get24hrTime() + "."
    ])
}

function advanceDay() {
    incrementDay()
    currentTime = 8

    player.energy = 30
    player.teleport("apartment")

    if (friend.readyToCompileInfo) {
        evidenceDocument.parent = friend
    }

    writeMultipleLines([
        "-----------------------",
    ])

    setTimeout(readOutTime, 2000)
    setTimeout(readOutSurroundings, 4000)
}

function endGame() {
    let lines = [
        "-----------------------"
    ]

    if (gameEnding == 1) {
        lines.push("You wake up and turn the computer on.")
        lines.push("On your taskbar, in the bottom right corner, you have a notification. Its the local news.")
        lines.push("'Greenfield local Marc Sollomans, 21, Arrested on suspicion of terrorism and possesion of an unregistered firearm.'")
        lines.push("'Theres no way..' You exclaim in your head.")
        lines.push("The first paragraph reads 'Earlier today at 4:30, Greenfield resident Marc Sollomans was raided by the Greenfield PD on suspicion of terrorism and possesion of an unregistered firearm.'")
        lines.push("'Officers found an AK-104 rifle that was never registered under Sollomans name, and multiple different class-A substances including cocaine and heroin. Sollomans is being held in custody and is awaiting trial.'")
        lines.push("You did it.")
        lines.push("Your city is safe. Congratulations.")
        lines.push("-----------------------")
        lines.push("Ending " + gameEnding.toString() + "/2: Arrest Marc Sollomans.")
    } else if (gameEnding == 2) {
        lines.push("You are awoken by a loud boom.")
        lines.push("You quickly look out of the window.")
        lines.push("In the distance you see the Greenfield Tower crumbling before your very eyes.")
        lines.push("Youve failed to stop the explosion.")
        lines.push("-----------------------")
        lines.push("Ending " + gameEnding.toString() + "/2: Marc Sollomans Wins")
    }

    lines.push("Refresh the browser to play again!")
    lines.push("Game created and programmed by Filip Rodak.")

    writeMultipleLines(lines)
}

// create player

let player = new Player

player.interactions = [
    {
        id: "check inventory",

        condition: function (keywords, rawCommand) {
            if (keywords[0] == "check" && keywords[1] == "inventory") {
                return true
            }
        },

        action: function (keywords) {
            let inventory = getItemsInRoom(player)

            if (inventory.length <= 0) {
                return writeLine("You have nothing in your bag.")
            }

            let invLines = ["In your bag you have:"]

            for (let i = 0; i < inventory.length; ++i) {
                let item = inventory[i]

                invLines.push("     " + item.id)
            }

            return writeMultipleLines(invLines)
        }
    },

    {
        id: "move by direction (N,E,S,W)",

        condition: function (keywords) {
            if (keywords[0] == "go" || keywords[0] == "move") {
                return true
            }
        },

        action: function (keywords) {
            if (player.energy <= 0) {
                return writeLine("Youre too tired.")
            }

            let currentRoom = GetRoomById(player.currentRoom)

            if (player.currentRoom == "apartment" && apartmentComputer.on) {
                return writeLine("You should probably turn the computer off first. That thing drains power.")
            }

            direction = getDirection(keywords[1])

            let room = currentRoom.exits[direction]

            if (room) {
                player.move(direction)

                let roomData = GetRoomById(room)

                return readOutSurroundings()
            }

            return writeLine("You cant go that way.")
        }
    },

    {
        id: "move to location",

        condition: function (keywords) {
            if ((keywords[0] == "go" && keywords[1] == "to") || keywords[0] == "enter") {
                return true
            }
        },

        action: function (keywords) {
            if (player.energy <= 0) {
                return writeLine("Youre too tired.")
            }

            let currentRoom = GetRoomById(player.currentRoom)

            if (player.currentRoom == "apartment" && apartmentComputer.on) {
                return writeLine("You should probably turn the computer off first. That thing drains power.")
            }

            let roomIndex = 1

            if (keywords[0] == "go") {
                let roomIndex = 2
            }

            let room = ""

            for (let i = roomIndex; i < 20; ++i) {
                if (!keywords[i]) {
                    continue
                }

                room = room + keywords[i] + " "
            }

            room = room.trim()

            for (let direction in currentRoom.exits) {
                let exitId = currentRoom.exits[direction]

                for (let roomIndex in currentRoom.exits) {
                    let roomName = currentRoom.exits[roomIndex]
                    let roomData = GetRoomById(roomName)

                    if (!roomData.nicknames) {
                        continue
                    }

                    for (let nickIndex in roomData.nicknames) {
                        let nickname = roomData.nicknames[nickIndex]

                        if (room == nickname) {
                            room = roomData.id
                            break
                        }
                    }
                }

                if (exitId == room) {
                    player.move(direction)

                    let roomData = GetRoomById(room)

                    return readOutSurroundings()
                }
            }

            return writeLine("That place isnt here.")
        }
    },

    {
        id: "exit current room",

        condition: function (keywords) {
            if (keywords[0] == "exit") {
                return true
            }
        },

        action: function (keywords) {
            if (player.energy <= 0) {
                return writeLine("Youre too tired.")
            }

            let currentRoom = GetRoomById(player.currentRoom)

            if (player.currentRoom == "apartment" && apartmentComputer.on) {
                return writeLine("You should probably turn the computer off first. That thing drains power.")
            }

            let directions = ["n", "s", "e", "w"]

            for (let i in directions) {
                let direction = directions[i]

                let room = currentRoom.exits[direction]

                if (room) {
                    player.move(direction)

                    let roomData = GetRoomById(room)

                    return readOutSurroundings()
                }
            }

            return writeLine("You cant exit the room. You are indefinitely trapped. You should really stop trying.")
        }
    },

    {
        id: "check time",

        condition: function (keywords, rawCommand) {
            if (rawCommand == "check the time" || rawCommand == "whats the time" || rawCommand == "check time") {
                return true
            }
        },

        action: function () {
            return readOutTime()
        }
    },

    {
        id: "take item",

        condition: function (keywords, rawCommand) {
            if ((keywords[0] == "pick" && keywords[1] == "up") || keywords[0] == "take") {
                return true
            }
        },

        action: function (keywords, rawCommand) {
            let itemName = keywords[1]

            if (keywords[0] == "pick" && keywords[1] == "up") {
                itemName = keywords[2]
            }

            let currentRoom = GetRoomById(player.currentRoom)
            let currentItems = getItemsInRoom(currentRoom)

            for (let i = 0; i < currentItems.length; ++i) {
                let currentItem = currentItems[i]

                if (currentItem.id.toLowerCase() == itemName) {
                    currentItem.parent = player

                    if (currentItem.description) {
                        return writeMultipleLines(["You pick up the " + currentItem.id, currentItem.description])
                    } else {
                        return writeLine("You pick up the " + itemName)
                    }
                }
            }

            return writeLine("Theres no items here like that.")
        }
    }
]

function readOutItems() {
    let currentRoom = GetRoomById(player.currentRoom)
    let currentItems = getItemsInRoom(currentRoom)

    let lines = []

    if (currentItems && currentItems.length > 0) {
        if (currentItems.length <= 1) {
            let currentItem = currentItems[0]

            if (currentItem) {
                return writeLine("There is a " + currentItem.id + " laying nearby")
            }
        }

        for (let i = 0; i < currentItems.length; ++i) {
            let currentItem = currentItems[i]

            lines.push("There is a " + currentItem.id + " laying nearby")
        }
    }

    return writeMultipleLines(lines)
}

function readOutRoom() {
    let currentRoom = GetRoomById(player.currentRoom)

    return writeLine(currentRoom.staticIdentifier + " " + currentRoom.description)
}

function readOutSurroundings() {
    let time = readOutRoom()
    time += setTimeout(readOutItems, time)
}

function getDirection(direction) {
    direction = direction.toLowerCase()
    direction = direction[0]

    return direction
}

// parser

gameEnding = null

function parse(command) {
    command = command.trim()

    let keywords = command.split(" ")

    for (let i = 0; i < keywords.length; ++i) {
        let currentWord = keywords[i]

        if (currentWord == "the" || currentWord == "him" || currentWord == "some" || currentWord == "for" || currentWord == "into") {
            keywords.splice(i, 1)

            --i
        }
    }

    command = ""

    for (let i = 0; i < keywords.length; ++i) {
        command += keywords[i] + " "
    }

    command = command.trim()

    console.log(keywords)

    let currentRoom = GetRoomById(player.currentRoom)

    let commandAreas = [
        currentRoom,
    ]

    for (let i = 0; i < items.length; ++i) {
        let currentItem = items[i]

        if (currentItem.parent == player) {
            commandAreas.push(currentItem)
        }
    }

    let objectsInRoom = getObjectsInRoom(currentRoom)

    for (let i = 0; i < objectsInRoom.length; ++i) {
        commandAreas.push(objectsInRoom[i])
    }

    let npcsInRoom = getNPCsInRoom(currentRoom)

    for (let i = 0; i < npcsInRoom.length; ++i) {
        commandAreas.push(npcsInRoom[i])
    }

    commandAreas.push(player)

    for (let i = 0; i < commandAreas.length; ++i) {
        let currentArea = commandAreas[i]

        if (!currentArea) {
            continue
        }

        let areaInteractions = currentArea.interactions

        if (!areaInteractions) {
            continue
        }

        for (let j = 0; j < areaInteractions.length; j++) {
            let currentInteraction = areaInteractions[j]

            let condition = currentInteraction.condition(keywords, command)

            if (condition) {
                let time = currentInteraction.action(keywords, command)

                if (!time) {
                    time = 3000
                }

                if (player.energy <= 0) {
                    setTimeout(writeLine, time, "Youre out of energy. You can come back to whatever you were doing tomorrow.")

                    if (currentDayName == "Tuesday") {
                        gameEnding = 2
                    }

                    if (gameEnding) {
                        setTimeout(endGame, time + 3000)
                    } else {
                        setTimeout(advanceDay, time + 3000)
                    }
                } else if (currentTime > 23) {
                    setTimeout(writeLine, time, "Its getting quite late by the way. Maybe you should leave this until tomorrow.")

                    setTimeout(advanceDay, time + 3000)
                }

                return
            }
        }
    }

    writeLine("I dont know what that means.")
}

// interfacing

let canInput = true

let outputBox = document.getElementById("output")
let inputBox = document.getElementById("input")

let pauseLengths = {
    "default": 30,
    "lineBreak": 1000,
    ".": 350,
    "!": 350,
    "?": 350,
    ",": 150
}

function scrollOutput(i) {
    if (i == null) {
        i = 28
    }

    if (i > 0) {
        outputBox.style.top = (Number(outputBox.style.top.split("px")[0]) - 1).toString() + "px"

        setTimeout(scrollOutput, 15, i - 1)
    }
}

function writeLine(text, isUserInput) {
    if (isUserInput) {
        text = "> " + text
    } else {
        text = "!! " + text
    }

    let newLine = document.createElement("p")
    outputBox.appendChild(newLine)

    let totalTime = 0

    for (let i = 0; i < text.length; ++i) {
        let timeout = pauseLengths[text[i]]

        if (!timeout) {
            timeout = pauseLengths.default
        }

        totalTime += timeout
    }

    if (outputBox.childElementCount > 25) {
        scrollOutput()
    }

    loopLine(newLine, text, 0)

    return totalTime
}

function writeMultipleLines(lines, isUserInput) {
    let totalTime = 0

    for (let i = 0; i < lines.length; ++i) {
        let currentLine = lines[i]

        setTimeout(writeLine, totalTime, currentLine, isUserInput)

        for (let j = 0; j < currentLine.length; j++) {
            let timeout = pauseLengths[currentLine[i]]

            if (!timeout) {
                timeout = pauseLengths.default
            }

            totalTime += timeout
        }

        totalTime += pauseLengths.lineBreak
    }

    return totalTime
}

function loopLine(line, text, i) {
    if (i < text.length) {
        canInput = false

        line.textContent += text[i]

        let timeout = pauseLengths[text[i]]

        if (!timeout) {
            timeout = pauseLengths.default
        }

        ++i

        setTimeout(loopLine, timeout, line, text, i)
    } else {
        canInput = true
    }
}

document.addEventListener("keydown", function (input) {
    if (input.key == "Enter" && canInput && !gameEnding) {
        writeLine(inputBox.value, true)
        parse(inputBox.value)

        inputBox.value = ""
    }
})

// create rooms

let apartment = AddRoom()
apartment.id = "apartment"
apartment.staticIdentifier = "You are in your apartment."
apartment.entryIdentifier = "You have entered your apartment."
apartment.description = "Your computer sits upon a shoddy desk, with a disheveled mattress on the floor. God you need to clean that thing. There is an exit to the south."
apartment.nicknames = ["apartment", "building", "apartment building"]
apartment.exits = {
    "s": "street15"
}

let apartmentComputer = new Object()
apartmentComputer.id = "apartment computer"
apartmentComputer.parent = apartment
apartmentComputer.lookerUpperEntries = [
    {
        name: "Marc Sollomans",
        age: 21,
        address: "21 Greenfield Lane GF5 26A",
        company: "Greenfield Grocers",
        employeeNumber: 987652
    },

    {
        name: "Simon Mark",
        age: 34,
        address: "78 Priory Street GF9 13J",
        company: "Pauls Plumbing",
        employeeNumber: 752165
    },

    {
        name: "Jack Smalls",
        age: 28,
        address: "19 Greenery Street GF3 56B",
        company: "Maquette Builds",
        employeeNumber: 377452
    },

    {
        name: "Sully Hall",
        age: 35,
        address: "83 Firth Boulevard GF9 24B",
        company: "Tesco",
        employeeNumber: 244995
    },

    {
        name: "Alice Barkley",
        age: 19,
        address: "42 Geralds Close GF6 04C",
        company: "The Co-operative Group",
        employeeNumber: 110948
    },

    {
        name: "Harry Marley",
        age: 47,
        address: "2 Simmons Lane GF2 12G",
        company: "Maquette Builds",
        employeeNumber: 227804
    },

    {
        name: "Evan Lister",
        age: 17,
        address: "87 Old Road GF8 70K",
        company: "Unemployed",
        employeeNumber: "None"
    },
]

apartmentComputer.currentLookerUpperEntry = 2

apartmentComputer.interactions = [
    {
        id: "use the computer",

        condition: function (keywords, rawCommand) {
            if (rawCommand == "turn on computer" || rawCommand == "use computer" || rawCommand == "go on computer") {
                return true
            }
        },

        action: function (keywords) {
            if (!apartmentComputer.on) {
                apartmentComputer.on = true
                apartmentComputer.page = "Browser"

                return writeMultipleLines([
                    "You turn on the computer.",
                    "As soon as the OS boots up, the Tor browser opens. You spend way too much time here. At the top of the browser you see 3 bookmarked pages titled 'Livewire', 'eMarkt', and 'LookerUpper'"
                ])

            } else {
                return writeLine("Its already on.")
            }
        }
    },

    {
        id: "access browser",

        condition: function (keywords, rawCommand) {
            if (rawCommand == "go back" || rawCommand == "go to browser") {
                if (apartmentComputer.on) {
                    return true
                }
            }
        },

        action: function (keywords, rawCommand) {
            if (apartmentComputer.page == "Browser") {
                return writeLine("Youre already on the browser.")
            }

            apartmentComputer.page = "Browser"

            return writeLine("You click the back button, and the Tor homepage opens. At the top of the browser you see 3 bookmarked pages titled 'Livewire', 'eMarkt', and 'LookerUpper'")
        }
    },

    {
        id: "access livewire",

        condition: function (keywords, rawCommand) {
            if (rawCommand == "go on livewire" || rawCommand == "click on livewire" || rawCommand == "click livewire" || rawCommand == "access livewire") {
                if (apartmentComputer.on && apartmentComputer.page == "Browser") {
                    return true
                }
            }
        },

        action: function () {
            if (apartmentComputer.page == "Livewire") {
                return writeLine("Youre already on Livewire.")
            }

            apartmentComputer.page = "Livewire"

            return writeMultipleLines([
                "You click on the Livewire bookmark.",
                "The screen goes a dark grey colour, and you see the large title fade in quickly, 'Livewire'.",
                "The page then promptly opens up a profile page, someone called 'capital12'. There is a stream replay from not too long ago that you can watch.",
                "This is the same stream where he was describing his plan to bomb the city."
            ])
        }
    },

    {
        id: "watch terrorists stream",

        condition: function (keywords, rawCommand) {
            if (rawCommand == "watch stream" || rawCommand == "watch livestream" || rawCommand == "watch terrorists stream" || rawCommand == "watch terrorists livestream") {
                if (apartmentComputer.on && apartmentComputer.page == "Livewire") {
                    return true
                }
            }
        },

        action: function (keywords, rawCommand) {
            if (player.terroristName) {
                return writeLine("You already know this guys name. What's the point of watching his radio show further?")
            }

            player.terroristName = true

            let lines = [
                "You watch capital12's livestream, trying to pay attention as closely as possible. Maybe hes stupid enough to leave hints?",
                "Yeah, turns out he is.",
                "You catch a brief glimpse of his company lanyard in the background. The badge reads 'Marc Sollomans | 987652'"
            ]

            if (player.terroristNameFamiliar) {
                lines.push("Wait....")
                lines.push("That names familiar....")

                player.foundTerroristOnLookerUpper = true
            }

            return writeMultipleLines(lines)
        }
    },

    {
        id: "record terrorists stream",

        condition: function (keywords, rawCommand) {
            if (rawCommand == "record stream" || rawCommand == "record livestream" || rawCommand == "record terrorists stream" || rawCommand == "record terrorists livestream") {
                if (apartmentComputer.on && apartmentComputer.page == "Livewire") {
                    return true
                }
            }
        },

        action: function (keywords, rawCommand) {
            if (player.hasPictureOfTerroristStream) {
                return writeLine("Youve already recorded enough of the livestream. Youre nearly running out of storage anyways.")
            }

            player.hasPictureOfTerroristStream = true

            return writeMultipleLines([
                "You take out your phone and record a solid 20 minutes of " + (player.terroristName && "Marc Solloman's" || "capital12's") + " livestream.",
                "The recording contains evidence of him maniacally ranting about bombing the Greenfield Tower, your local government building.",
                "He can also be seen weilding a rifle, making the threat much more serious.",
                "You should definitely do something with this info."
            ])
        }
    },

    {
        id: "access lookerupper",

        condition: function (keywords, rawCommand) {
            if (rawCommand == "go on looker upper" || rawCommand == "go on lookerupper" || rawCommand == "click looker upper" || rawCommand == "click lookerupper" || rawCommand == "click on looker upper" || rawCommand == "click on lookerupper" || rawCommand == "access lookerupper" || rawCommand == "access looker upper") {
                if (apartmentComputer.on && apartmentComputer.page == "Browser") {
                    return true
                }
            }
        },

        action: function (keywords, rawCommand) {
            if (apartmentComputer.page == "LookerUpper") {
                return writeLine("Youre already on LookerUpper.")
            }

            apartmentComputer.page = "LookerUpper"

            return writeMultipleLines([
                "You click on the LookerUpper bookmark.",
                "A bright white page appears. There is a search bar to search for people, along with two buttons to go forwards and backwards in the record."
            ])
        }
    },

    {
        id: "search for entry",

        condition: function (keywords, rawCommand) {
            if ((keywords[0] == "search" || keywords[0] == "look") && apartmentComputer.on && apartmentComputer.page == "LookerUpper") {
                return true
            }
        },

        action: function (keywords, rawCommand) {
            let name = ""

            for (let i = 1; i < keywords.length; ++i) {
                name += keywords[i] + " "
            }

            let entryData = null
            let currentEntry = null

            for (let i = 0; i < apartmentComputer.lookerUpperEntries.length; ++i) {
                let currentEntryData = apartmentComputer.lookerUpperEntries[i]

                if (currentEntryData.name.toLowerCase().trim() == name.toLowerCase().trim()) {
                    entryData = currentEntryData
                    currentEntry = i

                    break
                }
            }

            let lines = [
                "You search for " + name + "."
            ]

            if (entryData) {
                lines.push("A match is found.")
                lines.push("The entry reads:")
                lines.push("Name: " + entryData.name)
                lines.push("Age: " + entryData.age.toString())
                lines.push("Current Address: " + entryData.address)
                lines.push("Company: " + entryData.company)
                lines.push("Employee Number: " + entryData.employeeNumber.toString())
            } else {
                lines.push("There are no search results for that name.")
            }

            if (currentEntry == 0) {
                if (player.terroristName && !player.foundTerroristOnLookerUpper) {
                    lines.push("Bingo. This guy is capital12.")
                    lines.push("I need to do something with this info...")

                    player.foundTerroristOnLookerUpper = true
                }

                player.terroristNameFamiliar = true
            }

            return writeMultipleLines(lines)
        }
    },

    {
        id: "next entry",

        condition: function (keywords, rawCommand) {
            if (rawCommand == "next entry" || rawCommand == "advance entry" || rawCommand == "go forwards" || rawCommand == "next person") {
                if (apartmentComputer.on && apartmentComputer.page == "LookerUpper") {
                    return true
                }
            }
        },

        action: function () {
            apartmentComputer.currentLookerUpperEntry++

            if (apartmentComputer.currentLookerUpperEntry > apartmentComputer.lookerUpperEntries.length) {
                apartmentComputer.currentLookerUpperEntry = 0
            }

            let entryData = apartmentComputer.lookerUpperEntries[apartmentComputer.currentLookerUpperEntry]

            let time = writeMultipleLines([
                "You advance to the next entry.",
                "Heres what it reads:",
                "Name: " + entryData.name,
                "Age: " + entryData.age.toString(),
                "Current Address: " + entryData.address,
                "Company: " + entryData.company,
                "Employee Number: " + entryData.employeeNumber.toString()
            ])

            if (apartmentComputer.currentLookerUpperEntry == 0) {
                if (player.terroristName && !player.foundTerroristOnLookerUpper) {
                    player.foundTerroristOnLookerUpper = true

                    time += writeMultipleLines([
                        "Bingo. This guy is capitalbomber12.",
                        "I need to do something with this info..."
                    ])
                }

                player.terroristNameFamiliar = true
            }
        }
    },

    {
        id: "last entry",

        condition: function (keywords, rawCommand) {
            if (rawCommand == "last entry" || rawCommand == "go backwards" || rawCommand == "last person") {
                if (apartmentComputer.on && apartmentComputer.page == "LookerUpper") {
                    return true
                }
            }
        },

        action: function () {
            apartmentComputer.currentLookerUpperEntry--

            if (apartmentComputer.currentLookerUpperEntry < 0) {
                apartmentComputer.currentLookerUpperEntry = apartmentComputer.lookerUpperEntries.length
            }

            let entryData = apartmentComputer.lookerUpperEntries[apartmentComputer.currentLookerUpperEntry]

            let time = writeMultipleLines([
                "You go back to the last entry.",
                "Heres what it reads:",
                "Name: " + entryData.name,
                "Age: " + entryData.age.toString(),
                "Current Address: " + entryData.address,
                "Company: " + entryData.company,
                "Employee Number: " + entryData.employeeNumber.toString()
            ])

            if (apartmentComputer.currentLookerUpperEntry == 0) {
                if (player.terroristName && !player.foundTerroristOnLookerUpper) {
                    player.foundTerroristOnLookerUpper = true

                    time += writeMultipleLines([
                        "Bingo. This guy is capitalbomber12.",
                        "I need to do something with this info..."
                    ])
                }

                player.terroristNameFamiliar = true
            }

            return time
        }
    },

    {
        id: "shut down computer",

        condition: function (keywords, rawCommand) {
            if (rawCommand == "turn off computer" || rawCommand == "shut down computer" || rawCommand == "close computer" || rawCommand == "stop using computer") {
                return true
            }
        },

        action: function (keywords) {
            if (apartmentComputer.on) {
                apartmentComputer.on = false
                apartmentComputer.page = null

                return writeMultipleLines([
                    "You turn off the computer.",
                    "Hopefully the power bills wont be going through the roof now."
                ])
            } else {
                return writeLine("Its already off.")
            }
        }
    }
]

let friendApartment = AddRoom()
friendApartment.id = "friend apartment"
friendApartment.staticIdentifier = "You are in your friend's apartment."
friendApartment.entryIdentifier = "You have entered your friend's apartment."
friendApartment.description = "He's been your homie since day 1, so treat him well. You can ask him for a favor if you need it. There is an exit to the north."
friendApartment.nicknames = ["apartment", "building", "friends apartment"]
friendApartment.exits = {
    "n": "street9"
}

let evidenceDocument = new Item()
evidenceDocument.id = "Evidence Document"
evidenceDocument.description = "It has a bunch of information about Marc Sollomans, a terrorist who is planning to bomb the Greenfield Tower."
evidenceDocument.parent = null

let friend = new Player()
friend.id = "friend"
friend.parent = friendApartment
friend.interactions = [
    {
        id: "ask for money",

        condition: function (keywords, rawCommand) {
            if (rawCommand == "ask money" || rawCommand == "borrow money") {
                return true
            }
        },

        action: function (keywords, rawCommand) {
            if (player.askedFriendForMoney) {
                return writeLine("Youve already asked him for money. Get some of your own.")
            }

            if (friend.money > 0) {
                player.money += 5

                return writeMultipleLines([
                    "'Yo do you have any cash on you, I need some for something' you say, nervously",
                    "'Yeah alright. Ive got 5 dollars on me at the moment, you can take it.' he replies, handing you a 5 dollar bill."
                ])
            } else {
                return writeMultipleLines([
                    "'Yo do you have any cash on you, I need some for something' you say, nervously",
                    "'Nah man Im broke myself at the moment.' he replies.",
                    "Shame on you."
                ])
            }
        }
    },

    {
        id: "talk about terrorist",

        condition: function (keywords, rawCommand) {
            if (rawCommand == "tell about terrorist" || rawCommand == "tell about streamer" || rawCommand == "tell about explosion") {
                return true
            }
        },

        action: function (keywords, rawCommand) {
            let lines = []

            let playerItems = getItemsInRoom(player)
            let friendItems = getItemsInRoom(friend)

            if (playerItems.indexOf(evidenceDocument) >= 0 || player.submittedEvidence) {
                lines.push("Hes already done his part of the work.")
            } else if (friend.readyToCompileInfo) {
                lines.push("Theres not much to talk about the terrorist anymore. Wait for him to compile the evidence document.")
            } else if (friendItems.indexOf(evidenceDocument) >= 0) {
                evidenceDocument.parent = player

                lines.push("'Alright man, here you go. Document with a bunch of evidence. You should prolly go to the station with this.' As he hands you the evidence of Marc Sollomans.")
                lines.push("'Dude thank you so much. I owe you one for that.'")
                lines.push("You should probably go to the station with this.")

            } else if (player.toldFriendAboutTerrorist) {
                if (!(
                    (player.hasPictureOfTerroristStream && !friend.hasStreamPhoto) ||
                    (player.foundTerroristOnLookerUpper && !friend.knowsTerroristAddress)
                )) {
                    lines.push("What do you have to say? You dont have any new leads about the terrorist.")

                } else if (!friend.knowsTerroristAddress && player.foundTerroristOnLookerUpper) {
                    friend.knowsTerroristAddress = true

                    lines.push("'Dude, you know that terrorist I told you about? I've got some info on him.'")
                    lines.push("'Nice, what'd you learn?'")
                    lines.push("'I got his address and company info and stuff. This is huge.'")
                    lines.push("'Alright, bet. How do you know its actually him though?'")
                    lines.push("'I've watched his livestream. Stupid guy had his company lanyard in the background. It reads his name clearly, Marc Sollomans.'")

                    if (friend.hasStreamPhoto || player.hasPictureOfTerroristStream) {
                        if (player.hasPictureOfTerroristStream) {
                            lines.push("'How are you sure Its him?'")
                            lines.push("'I got a short video of his livestream. In the background you can see his company lanyard. It reads his name clearly, Marc Sollomans. And watch the video, he's got his gun in it and everything, threatening to bomb our capital. Crazy stuff.'")
                        }

                        friend.readyToCompileInfo = true

                        lines.push("'Oh shit, then we can probably get this guy jailed now. Weve got his address, company and literal proof of what hes planning to do.'")
                        lines.push("'Youre so right. I mean, I got it all off the dark web. Do you reckon you could legitimise it? Im awful with the law so, yeah.'")
                        lines.push("'Bet man. I'll do it later today when I've got time. Come back tomorrow and I'll hand it over to you.'")
                        lines.push("'Alright man, In a bit.' You say, as the two of you part ways.")

                        player.teleport("street9")
                    } else {
                        lines.push("'Oh damn, alrightt. You could get more info of his on the internet somewhere. Im not sure just an address of a random dudes gonna help.'")
                        lines.push("'Yeah I suppose. I mean, I guess I could try to dig around some more, but no promises.'")
                        lines.push("'Alright, well, if you learn anything new, make sure to let me know.' He says. You should probably get some more info.")
                    }
                } else if (!friend.hasStreamPhoto && player.hasPictureOfTerroristStream) {
                    friend.hasStreamPhoto = true

                    lines.push("'Dude, you know that terrorist I told you about? I've got some info on him.'")
                    lines.push("'Bet, lets see.'")
                    lines.push("'I got a short video of his livestream. In the background you can see his company lanyard. It reads his name clearly, Marc Sollomans. And watch the video, he's got his gun in it and everything, threatening to bomb our capital. Crazy stuff.'")

                    if (friend.knowsTerroristAddress || player.foundTerroristOnLookerUpper) {
                        if (player.foundTerroristOnLookerUpper) {
                            lines.push("'Oh damn, alrightt. You could get more info of his on the internet somewhere if youve got his name. Im not sure just a video is gonna help.'")
                            lines.push("'Yeah well, I got his address and company information and stuff too. Thats really huge.'")
                        }

                        friend.readyToCompileInfo = true

                        lines.push("'Oh shit, then we can probably get this guy jailed now. Weve got his address, company and literal proof of what hes planning to do.'")
                        lines.push("'Youre so right. I mean, I got it all off the dark web. Do you reckon you could legitimise it? Im awful with the law so, yeah.'")
                        lines.push("'Bet man. I'll do it later today when I've got time. Come back tomorrow and I'll hand it over to you.'")
                        lines.push("'Alright man, In a bit.' You say, as the two of you part ways.")

                        player.teleport("street9")
                    } else {
                        lines.push("'Oh damn, alrightt. You could get more info of his on the internet somewhere if youve got his name. Im not sure just a video is gonna help.'")
                        lines.push("'Yeah I suppose. I mean, I guess I could try to dig around some more, but no promises.'")
                        lines.push("'Alright, well, if you learn anything new, make sure to let me know.' He says. You should probably get some more info.")
                    }
                }
            } else {
                player.toldFriendAboutTerrorist = true

                lines.push("'Yo, listen, I need to tell you about something important. Theres some terrorist on the dark web thats gonna blow up our capital building.' You exclaim manically.")
                lines.push("'Calm down, you've gone crazy again.' He says jokingly, not believing you.")
                lines.push("You calm down and try to convince him in a calmer manner. 'Im being serious. This is no joke man. Im actually being serious.'")
                lines.push("'Alright. Well, do you have any info on this guy? We need to stop him if youre actually being serious.'")

                if (player.foundTerroristOnLookerUpper) {
                    friend.knowsTerroristAddress = true

                    lines.push("'I've got his address, and the company he works at, and his full name.'")
                    lines.push("'How are you sure It's him?' Your friend is still not fully convinced.")

                    if (player.hasPictureOfTerroristStream) {
                        friend.hasStreamPhoto = true
                        friend.readyToCompileInfo = true

                        lines.push("'I've got a short video of his livestream. In the background you can see his company lanyard. It reads his name clearly, Marc Sollomans. And watch the video, he's got his gun in it and everything, threatening to bomb our capital. Do you believe me now?'")
                        lines.push("'Oh shit... Alright heres what we're gonna do.' He exclaims, finally realising the danger. Im gonna compile this info and then we can report this guy.'")
                        lines.push("'Alright man, let me send you the video real quick.' You say, while uploading the file to your Whatsapp DM.")
                        lines.push("'Bet man. Well, I gotta get back to doing what I was doing.'")
                        lines.push("'Alright, I'll be going now too.' You reply.")
                        lines.push("'In a bit man.' He says, as the two of you part ways.")

                        player.teleport("street9")
                    } else {
                        lines.push("'I got a glimpse of his company lanyard on his stream replay.' You say, despite having no proof.")
                        lines.push("'Do you have a picture?'")
                        lines.push("'Uh, no, but I can run home and get one for you. I promise you this guy is real.'")
                        lines.push("'Alright, listen. Get that picture and come back to me with it. I'll compile the evidence you have for you and we can report this guy.'")
                    }

                    friend.knowsTerroristName = true
                } else if (player.hasPictureOfTerroristStream) {
                    friend.hasStreamPhoto = true

                    lines.push("'I've got a video of his stream. Hes claiming some mad stuff while manically pointing his gun around. His name is on his company lanyard in the background too.' You tell him.")
                    lines.push("'Damn that sounds crazy. Do you know anything else about the guy? We could report him to the police but we just need more info.'")
                    lines.push("'Not at the moment. I know a good website for looking people up. Ill run home in a sec to see if hes on there.'")
                    lines.push("'Alright, bet'")
                } else {
                    lines.push("'Not at the moment no, but trust me you need to believe me.' You say, trying to justify your discovery.")
                    lines.push("'I dont know man, that sounds fake.' He doesnt believe you.")
                }
            }

            let time = writeMultipleLines(lines)

            if (player.currentRoom == "street9") {
                time += setTimeout(readOutSurroundings, time)
                return time
            }
        }
    }
]

let book = new Item()
book.id = "Book"
book.description = "The title reads 'The Anarchist's Cookbook'. The back cover is completely plain, and the book is covered in a faded dark blue."
book.parent = apartment

let library = AddRoom()
library.id = "library"
library.staticIdentifier = "You are in the Library."
library.entryIdentifier = "You have entered the Library."
library.description = "Here you have endless access to books, printers, computers, whatever you may need! There is an exit to the west."
library.nicknames = ["library", "bookstore"]
library.exits = {
    "w": "street2"
}

let gunStore = AddRoom()
gunStore.id = "gun store"
gunStore.staticIdentifier = "You are in the Gun Store."
gunStore.entryIdentifier = "You have entered the Gun Store."
gunStore.description = "With a suitable gun license, you can purchase any firearm your heart desires! if you have money of course... There is an exit to the west."
gunStore.nicknames = ["store", "gun shop", "shop"]
gunStore.exits = {
    "w": "street6"
}

let store = AddRoom()
store.id = "convenience store"
store.staticIdentifier = "You are in the Convenience Store."
store.entryIdentifier = "You have entered the Convenience Store."
store.description = "There are plenty of items you can buy here. Just dont go spending your life savings in the endless isles! There is an exit to the east."
store.nicknames = ["store", "shop"]
store.exits = {
    "e": "street2"
}

let govBuilding = AddRoom()
govBuilding.id = "gov building"
govBuilding.staticIdentifier = "You are in the local Government Building"
govBuilding.entryIdentifier = "You have entered the local Government Building"
govBuilding.description = "This place looks dystopian as hell. Modern architecture paired with endless cubicles for people to work in. You better save this place before wednesday. There is an exit to the south."
govBuilding.nicknames = ["building", "government building"]
govBuilding.exits = {
    "s": "street9"
}

let police = AddRoom()
police.id = "police station"
police.staticIdentifier = "You are in the Police Station."
police.entryIdentifier = "You have entered the Police Station."
police.description = "These guys can barely do their job, but still worth a shot if all else fails. There is an exit to the north."
police.nicknames = ["police", "station"]
police.exits = {
    "n": "street8"
}

police.interactions = [
    {
        id: "hand over evidence",

        condition: function (keywords, rawCommand) {
            if (rawCommand == "hand over evidence" || rawCommand == "give evidence" || rawCommand == "turn in evidence") {
                return true
            }
        },

        action: function (keywords, rawCommand) {
            let playerItems = getItemsInRoom(player)

            if (playerItems.indexOf(evidenceDocument) >= 0) {
                return writeMultipleLines([
                    "'Hello, Id like to report a crime.' You say, timidly. 'There have been threats made online about the Greenfield Tower and I have some evidence as well which id like to report.'",
                    "'Oh, Its you again. You havent been using that bloody browser again?' The officer replies. The dark web is illegalised in this part of the country.",
                    "'No, this guy was making these threats on the regular web. Some website called Twitch. Heres the evidence, I think you should take a look at it.'",
                    "The officer takes your file of evidence. 'Bloody hell. This guys mad. Alright well I'll submit this for our detectives to look into. Give it a few days and we'll make progress.'",
                    "'Alright, thank you officer.'",
                    "'All good. Good on you for reporting this. May I take your name?'",
                    "'###### #########.'",
                    "'Alright, thank you. That should be everything. The detectives will keep their eyes peeled.'",
                ])

                gameEnding = 1
            } else {
                return writeLine("You dont have any evidence to hand in.")
            }
        }
    }
]

// create streets

// i cant be asked to re-structure the streets, and they dont really have any interactions at the moment so who cares really.

AddRoom("street0", {
    "s": "street4"
}, "You are outside on the street.",
    "The street only extends south."
)
AddRoom("street2", {
    "e": "library",
    "w": "convenience store",
    "s": "street6"
}, "You are outside on the street.",
    "The street only extends south. To your east is the library, and to your west is the local convenience store."
)
AddRoom("street4", {
    "e": "gov building",
    "n": "street0",
    "s": "street8"
}, "You are outside on the street.",
    "The street extends north and south. To your east is the government building."
)
AddRoom("street6", {
    "e": "gun store",
    "n": "street2",
    "s": "street10",
    "w": "gov building"
}, "You are outside on the street.",
    "The street extends north and south. To your east is the gun store, and to your west is the government building."
)
AddRoom("street8", {
    "s": "police station",
    "n": "street4",
    "e": "street9"
}, "You are outside on the street.",
    "The street extends north and east. To your south is the police station."
)
AddRoom("street9", {
    "n": "gov building",
    "w": "street8",
    "e": "street10",
    "s": "friend apartment"
}, "You are outside on the street.",
    "The street extends east and west. To your south is your friend's apartment, and to your north is the government building."
)
AddRoom("street10", {
    "w": "street9",
    "n": "street6",
    "s": "street14"
}, "You are outside on the street.",
    "The street extends west, north, and south."
)
AddRoom("street14", {
    "n": "street10",
    "e": "street15"
}, "You are outside on the street.",
    "The street extends north and east."
)
AddRoom("street15", {
    "w": "street14",
    "n": "apartment"
}, "You are outside on the street.",
    "The street only extends west. To your north is your apartment building."
)

// game flow

let descriptionTime = writeMultipleLines([
    "Welcome to Deadline.",
    "The day is " + currentDayName + ", and the time is " + get24hrTime() + ".",
    "You live alone, so you spend most of your time online.",
    "Not too long ago, you stumbled upon the 'Dark Web' which you frequently access through the Tor browser.",
    "You've recently discovered Livewire, a social media platform which allows users of the dark web to broadcast anything live, with no restrictions.",
    "A streamer named 'capital12' who uses Livewire claims that he is going to detonate an explosive in the Greenfield Tower, an important government building in your city.",
    "You cant let your home go out like this.",
    "You have until Wednesday.",
    "Good luck."
])

setTimeout(writeLine, descriptionTime - 800, "-----------------------")
setTimeout(readOutSurroundings, descriptionTime + 500)